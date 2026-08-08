import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { collectMethodKinds } from './methodDecorators';
import {
	CreateServiceSliceOptions, ModuleStore, ResetActionCreator, SerializedClientError, ServiceClass,
	ServiceMethodKind, ServiceMethodState, ServiceMethodThunk, ServiceSlice, SyncActionCreator,
} from './types';

import type { ActionReducerMapBuilder } from '@reduxjs/toolkit';


/** Never dispatched yet. */
const initialMethodState: ServiceMethodState = {
	status: null,
	data: null,
	clientErrors: [],
	error: null,
	doneAt: 0,
};

/**
 * Flattens `ClientErrorItem`s to plain JSON.
 *
 * `ClientErrorItem extends Error` and holds `#private` fields, so putting one in the store
 * would break serializability and time-travel debugging.
 */
export function serializeClientErrors(items: unknown): SerializedClientError[] {
	if (!Array.isArray(items)) return [];
	// `ClientErrorItem` exposes its kind as `name` (it implements `Error`); a plain object
	// coming straight from the API uses `type`.
	return items.map(item => ({
		key: String(item?.key ?? ''),
		message: String(item?.message ?? ''),
		type: String(item?.name ?? item?.type ?? 'error'),
		...(item?.field == null ? {} : { field: String(item.field) }),
	}));
}

/** True for a `{ data, clientErrors }` envelope, which every `CrudServiceBase` method returns. */
function isServiceResult(value: unknown): value is { data: unknown, clientErrors: unknown } {
	if (value == null || typeof value !== 'object') return false;
	const envelope = value as { data?: unknown, clientErrors?: unknown };
	return Array.isArray(envelope.clientErrors) && 'data' in envelope;
}

/**
 * One thunk per service method.
 *
 * Only a **thrown** error rejects. A `{data, clientErrors}` envelope carrying client errors
 * is a completed call — the server answered, and said no — so it fulfils and the reducer
 * routes those errors to `clientErrors`.
 *
 * The method is called **on the instance**: `CrudServiceBase` reads `#eventBus`, a true
 * private field, so an unbound call would throw a TypeError.
 *
 * A multi-argument method (`manageM2m`) is dispatched with its params as an array; a
 * single-argument one takes the value directly, which is the common case by far.
 */
function createMethodThunk(sliceName: string, methodName: string, getInstance: () => any): ServiceMethodThunk {
	return createAsyncThunk<any, any, { rejectValue: string }>(
		`${sliceName}/${methodName}`,
		async (params, { rejectWithValue }) => {
			try {
				const instance = getInstance();
				const method = instance[methodName];
				if (typeof method !== 'function') {
					throw new Error(`${sliceName}.${methodName} is not a function on the service instance.`);
				}
				const args = Array.isArray(params) ? params : [params];
				const result = await method.apply(instance, args);
				// Serialize here, not in the reducer: `ClientErrorItem extends Error` with
				// `#private` fields, and the raw instance would otherwise ride along in the
				// action payload even though the reducer keeps it out of the state tree.
				if (isServiceResult(result)) {
					return { data: result.data ?? null, clientErrors: serializeClientErrors(result.clientErrors) };
				}
				return result;
			}
			catch (error) {
				console.error(error);
				const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
				return rejectWithValue(errorMessage);
			}
		},
	);
}

/** The pending / fulfilled / rejected / reset cases maintaining `state[methodName]`. */
function addMethodCases(
	builder: ActionReducerMapBuilder<any>,
	methodName: string,
	thunk: ServiceMethodThunk,
	resetAction: ResetActionCreator,
): void {
	builder
		.addCase(thunk.pending, (state: any) => {
			state[methodName].status = 'pending';
			state[methodName].error = null;
			state[methodName].clientErrors = [];
		})
		.addCase(thunk.fulfilled, (state: any, action: any) => {
			const result = action.payload;
			// The thunk already unwrapped and serialized the envelope; anything else is a
			// service that does not use one, and is stored as-is.
			const isEnvelope = isServiceResult(result);
			state[methodName].status = 'fulfilled';
			state[methodName].data = isEnvelope ? (result.data ?? null) : (result ?? null);
			state[methodName].clientErrors = isEnvelope ? (result.clientErrors as SerializedClientError[]) : [];
			state[methodName].error = null;
			state[methodName].doneAt = Date.now();
		})
		.addCase(thunk.rejected, (state: any, action: any) => {
			state[methodName].status = 'rejected';
			state[methodName].error = action.payload ?? action.error?.message ?? 'Request failed';
			state[methodName].data = null;
			state[methodName].clientErrors = [];
			state[methodName].doneAt = Date.now();
		})
		.addCase(resetAction as any, (state: any) => {
			state[methodName] = { ...initialMethodState };
		});
}

/**
 * Carries the call's arguments as the action payload.
 *
 * A multi-argument sync method is dispatched with its params as an array, matching what
 * `createMethodThunk` does for the async side, so both kinds are called the same way.
 */
function prepareSyncPayload(...args: any[]) {
	return { payload: args.length === 1 ? args[0] : args };
}

/**
 * The single case maintaining a `@storeSyncMethod`'s state.
 *
 * The method runs inside the reducer and its return value *is* the new state — there is
 * no envelope, because a synchronous call cannot be pending and cannot reject in a way
 * the store should record.
 */
function addSyncMethodCase(
	builder: ActionReducerMapBuilder<any>,
	methodName: string,
	action: SyncActionCreator,
	getInstance: () => any,
	resetAction: ResetActionCreator,
): void {
	builder
		.addCase(action as any, (state: any, dispatched: any) => {
			const instance = getInstance();
			const args = Array.isArray(dispatched.payload) ? dispatched.payload : [dispatched.payload];
			state[methodName] = instance[methodName](...args) ?? null;
		})
		.addCase(resetAction as any, (state: any) => {
			state[methodName] = null;
		});
}

function buildInitialState(
	kinds: Record<string, ServiceMethodKind>, overrides?: Record<string, unknown>,
): Record<string, unknown> {
	const state: Record<string, unknown> = {};
	// Every key must exist up front: the async reducers mutate state[methodName] in place.
	// A sync method has no envelope, so it starts as null and is replaced wholesale.
	for (const [methodName, kind] of Object.entries(kinds)) {
		state[methodName] = kind === 'sync' ? null : { ...initialMethodState };
	}
	return { ...state, ...overrides };
}

/** One action per annotated method: a thunk for an async one, a plain action for a sync one. */
function buildMethodActions(
	sliceName: string, kinds: Record<string, ServiceMethodKind>, getInstance: () => any,
) {
	const thunks: Record<string, ServiceMethodThunk> = {};
	const syncActions: Record<string, SyncActionCreator> = {};
	const resetActions: Record<string, ResetActionCreator> = {};

	for (const [methodName, kind] of Object.entries(kinds)) {
		if (kind === 'sync') {
			syncActions[methodName] = createAction(
				`${sliceName}/${methodName}`, prepareSyncPayload,
			) as SyncActionCreator;
		}
		else {
			thunks[methodName] = createMethodThunk(sliceName, methodName, getInstance);
		}
		resetActions[methodName] = createAction(`${sliceName}/${methodName}/reset`) as ResetActionCreator;
	}

	return { thunks, syncActions, resetActions };
}

/**
 * Builds a slice from a service class and registers it with `moduleStore`.
 *
 * Only methods annotated `@storeAsyncMethod` / `@storeSyncMethod` take part. An async
 * one becomes a thunk plus the reducer cases maintaining `state[methodName]`; a sync one
 * becomes a single action whose reducer runs the method and stores its return value.
 * An unannotated method stays an ordinary helper with no presence in the store.
 */
export function createServiceSlice<TInstance>(
	moduleStore: ModuleStore,
	serviceClass: ServiceClass<TInstance>,
	instance: TInstance,
	options: CreateServiceSliceOptions = {},
): ServiceSlice<TInstance> {
	// Required, and normally supplied by `@storeService`. Checked here too because
	// `createServiceSlice` is on the public `ModuleStore` interface and can be called directly.
	const sliceName = options.sliceName;
	if (!sliceName) {
		throw new Error('createServiceSlice requires options.sliceName.');
	}
	const kinds = collectMethodKinds(serviceClass);
	const methodNames = Object.keys(kinds);
	const { thunks, syncActions, resetActions } = buildMethodActions(sliceName, kinds, () => instance);

	const slice = createSlice({
		name: sliceName,
		initialState: buildInitialState(kinds, options.initialState),
		reducers: options.reducers ?? {},
		extraReducers: (builder: ActionReducerMapBuilder<any>) => {
			for (const [methodName, kind] of Object.entries(kinds)) {
				if (kind === 'sync') {
					addSyncMethodCase(
						builder, methodName, syncActions[methodName], () => instance, resetActions[methodName],
					);
				}
				else {
					addMethodCases(builder, methodName, thunks[methodName], resetActions[methodName]);
				}
			}
			// Last, so a caller can override any generated case.
			options.extraReducers?.(builder);
		},
	});

	moduleStore.injectSliceReducer(sliceName, slice.reducer);

	return {
		name: sliceName,
		reducer: slice.reducer as any,
		actions: { ...slice.actions, ...thunks, ...syncActions, ...resetActions },
		thunks,
		syncActions,
		resetActions,
		methodNames,
	};
}
