import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { collectServiceMethods } from './collectServiceMethods';
import {
	CreateServiceSliceOptions, ModuleStore, ResetActionCreator, SerializedClientError, ServiceClass,
	ServiceMethodState, ServiceMethodThunk, ServiceSlice,
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

/** Resolves the slice name and rejects the shapes that would silently corrupt state. */
export function resolveSliceName(serviceClass: ServiceClass, override?: string): string {
	const name = override ?? serviceClass.name;
	if (!name) {
		throw new Error(
			'A service class must have a non-empty name to become a slice. '
			+ 'Anonymous class expressions need an explicit { sliceName } option.',
		);
	}
	if (!override && name.length <= 2) {
		throw new Error(
			`Slice name '${name}' looks minified. Set build.minify.mangle.keepNames in the module's `
			+ 'vite.config.ts, or pass an explicit { sliceName }.',
		);
	}
	return name;
}

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

function buildInitialState(methodNames: string[], overrides?: Record<string, unknown>): Record<string, unknown> {
	const state: Record<string, unknown> = {};
	// Every key must exist up front: the reducers above mutate state[methodName] in place.
	for (const methodName of methodNames) {
		state[methodName] = { ...initialMethodState };
	}
	return { ...state, ...overrides };
}

/**
 * Builds a slice from a service class and registers it with `moduleStore`.
 *
 * Each method becomes an async thunk plus the reducer cases that maintain
 * `state[methodName]`. A method cannot literally *be* a reducer — reducers are
 * synchronous and pure, while every service method is async.
 */
export function createServiceSlice<TInstance>(
	moduleStore: ModuleStore,
	serviceClass: ServiceClass<TInstance>,
	instance: TInstance,
	options: CreateServiceSliceOptions = {},
): ServiceSlice<TInstance> {
	const sliceName = resolveSliceName(serviceClass, options.sliceName);
	const methodNames = collectServiceMethods(serviceClass);

	const thunks: Record<string, ServiceMethodThunk> = {};
	const resetActions: Record<string, ResetActionCreator> = {};
	for (const methodName of methodNames) {
		thunks[methodName] = createMethodThunk(sliceName, methodName, () => instance);
		resetActions[methodName] = createAction(`${sliceName}/${methodName}/reset`) as ResetActionCreator;
	}

	const slice = createSlice({
		name: sliceName,
		initialState: buildInitialState(methodNames, options.initialState),
		reducers: options.reducers ?? {},
		extraReducers: (builder: ActionReducerMapBuilder<any>) => {
			for (const methodName of methodNames) {
				addMethodCases(builder, methodName, thunks[methodName], resetActions[methodName]);
			}
			// Last, so a caller can override any generated case.
			options.extraReducers?.(builder);
		},
	});

	moduleStore.injectSliceReducer(sliceName, slice.reducer);

	return {
		name: sliceName,
		reducer: slice.reducer as any,
		actions: { ...slice.actions, ...thunks, ...resetActions },
		thunks,
		resetActions,
		methodNames,
	};
}
