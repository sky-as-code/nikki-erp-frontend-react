import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { ClientErrors } from '@nikkierp/common/types';
import {
	ActionCreatorWithoutPayload,
	ActionReducerMapBuilder,
	AsyncThunk,
	AsyncThunkConfig,
	AsyncThunkPayloadCreator,
	createAction,
	createAsyncThunk,
	createSelector,
} from '@reduxjs/toolkit';
import { useMemo } from 'react';
import { UseSelector } from 'react-redux';

import { UseStateSelectorFn } from '../microApp';


export type ReduxActionThunkApi<TReturn = any, TArg = any> =
	Parameters<AsyncThunkPayloadCreator<TReturn, TArg, ReduxActionThunkConfig>>[1];
type ReduxActionThunkFn<TReturn, TArg> =
	(thunkArgs: TArg, thunkApi: ReduxActionThunkApi<TReturn, TArg>) => Promise<TReturn>;
/**
 * May resolve either to the payload directly or to a `{data, clientErrors}` envelope;
 * `unwrapServiceResult` collapses the latter before the thunk resolves.
 */
type SchemaReduxActionThunkFn<TReturn, TArg> = (
	schema: dyn.SchemaPack, thunkArgs: TArg, thunkApi: ReduxActionThunkApi<TReturn, TArg>,
) => Promise<TReturn | ServiceResult<TReturn>>;
type ReduxActionThunkConfig = { rejectValue: any };

export interface ReduxThunkState<T =  any> {
	isLoading: boolean;
	isDone: boolean;
	isError: boolean;
	error: unknown | null;
	data: T | null;
	doneAt:  number;
	requestId?: string | null;
}

export type ThunkPackHookReturn<TReturn, TArg> = {
	thunkAction: AsyncThunk<TReturn, TArg, { rejectValue: any }>;
	resetAction: ActionCreatorWithoutPayload<string>;
	isLoading: boolean;
	isDone: boolean;
	isError: boolean;
	error: unknown | null;
	data: TReturn | null;
	doneAt: number;
};

export type ThunkPack<TReturn = void, TArg = void, TStateKey extends string = string> = {
	stateKey: TStateKey,
	thunkAction: AsyncThunk<TReturn, TArg, { rejectValue: any }>,
	resetAction: ActionCreatorWithoutPayload<string>,
	initialState: ReduxThunkState<TReturn>,
	selector: (state: any) => ReduxThunkState<TReturn>,
	buildThunkReducers: (builder: ActionReducerMapBuilder<any>) => void,
	useHook: (useSelectorFn: ThunkPackUseSelectorFn, throwOnError?: boolean) => ThunkPackHookReturn<TReturn, TArg>,
};

export type ThunkPackUseSelectorFn = UseStateSelectorFn<any> | UseSelector<unknown>;

export function createSchemaThunkPack<TReturn, TArg, TStateKey extends string>(
	sliceName: string,
	actionName: TStateKey,
	serviceFn: SchemaReduxActionThunkFn<TReturn, TArg>,
): ThunkPack<TReturn, TArg, TStateKey> {
	const thunkName = buildThunkName(sliceName, actionName);
	const thunk = createSchemaThunk(sliceName, thunkName, serviceFn);
	return buildThunkPack(sliceName, actionName, thunkName, thunk);
}

export function createThunkPack<TReturn, TArg, TStateKey extends string>(
	sliceName: string,
	actionName: TStateKey,
	fn: ReduxActionThunkFn<TReturn, TArg>,
): ThunkPack<TReturn, TArg, TStateKey> {
	const thunkName = buildThunkName(sliceName, actionName);
	const thunk = createThunk(thunkName, fn);
	return buildThunkPack(sliceName, actionName, thunkName, thunk);
}

function buildThunkPack<TReturn, TArg, TStateKey extends string>(
	sliceName: string,
	actionName: TStateKey,
	thunkName: string,
	thunk: AsyncThunk<TReturn, TArg, { rejectValue: any }>,
): ThunkPack<TReturn, TArg, TStateKey> {
	const selector = createSelector(
		(rootState: any) => {
			return rootState[sliceName];
		},
		selectThunkStateFactory(actionName));
	const resetAction = createAction(`${thunkName}/reset`);

	return {
		stateKey: actionName,
		thunkAction: thunk,
		resetAction,
		initialState: baseReduxThunkState,
		selector,
		buildThunkReducers(builder: ActionReducerMapBuilder<any>) {
			buildThunkReducers(builder, thunk, resetAction, actionName);
		},
		/**
		 *
		 * @param useSelectorFn Pass the useSelector function from react-redux or useMicroAppSelector.
		 * @param throwOnError If true, throw an error if the thunk is in error state. Only set this param when
		 * you are sure the component is wrapped with ErrorBoundary.
		 */
		useHook(useSelectorFn: ThunkPackUseSelectorFn, throwOnError: boolean = false) {
			const thunkState = (useSelectorFn as any)(selector) as ReduxThunkState<TReturn>;
			if (throwOnError && thunkState.isError) {
				throw thunkState.error;
			}
			return useMemo(
				() => buildThunkHookReturn(thunk, resetAction, thunkState),
				[
					thunkState.isLoading,
					thunkState.isDone,
					thunkState.isError,
					thunkState.error,
					thunkState.data,
					thunkState.doneAt,
				],
			);
		},
	};
}

function buildThunkHookReturn<TReturn, TArg>(
	thunkAction: AsyncThunk<TReturn, TArg, { rejectValue: any }>,
	resetAction: ActionCreatorWithoutPayload<string>,
	thunkState: ReduxThunkState<TReturn>,
): ThunkPackHookReturn<TReturn, TArg> {
	return {
		thunkAction,
		resetAction,
		isLoading: thunkState.isLoading,
		isDone: thunkState.isDone,
		isError: thunkState.isError,
		error: thunkState.error,
		data: thunkState.data as TReturn | null,
		doneAt: thunkState.doneAt,
	};
}

function selectThunkStateFactory(thunkName: string) {
	return (sliceState: any) => {
		return sliceState[thunkName] as ReduxThunkState;
	};
}

export const baseReduxThunkState : ReduxThunkState = {
	isLoading: false,
	isDone: false,
	isError: false,
	error: null,
	data: null,
	requestId: null,
	doneAt: 0,
};

export function buildResetThunkReducer(actionName: string) {
	return (state: any) => {
		state[actionName] = baseReduxThunkState;
	};
}

export function buildThunkReducers<
	TReturn,
	TArg,
	TConfig extends AsyncThunkConfig,
>(
	builder: ActionReducerMapBuilder<any>,
	thunk: AsyncThunk<TReturn, TArg, TConfig>,
	resetAction: ActionCreatorWithoutPayload<string>,
	actionName: string,
) {
	builder
		.addCase(thunk.pending, reducerThunkPending(actionName))
		.addCase(thunk.fulfilled, reducerThunkDone(actionName))
		.addCase(thunk.rejected, reducerThunkError(actionName))
		.addCase(resetAction, buildResetThunkReducer(actionName));
}

function reducerThunkPending(action: string) {
	return (state: {[key: string]: ReduxThunkState}) => {
		state[action].isLoading = true;

		state[action].isDone = false;
		state[action].isError = false;
		state[action].error = null;
		state[action].data = null;
	};
}

function reducerThunkDone(action: string) {
	return (state: {[key: string]: ReduxThunkState}, param: any) => {
		state[action].isDone = true;

		state[action].isLoading = false;
		state[action].isError = false;
		state[action].data = param.payload;
		state[action].error = null;
		state[action].doneAt = Date.now();
	};
}

function reducerThunkError(action: string) {
	return (state: {[key: string]: ReduxThunkState}, param: any) => {
		state[action].isError = true;

		state[action].isLoading = false;
		state[action].isDone = false;
		state[action].error = param.payload || 'Failed to ' + action;
		state[action].data = null;
	};
}

/**
 * Unwraps a `{data, clientErrors}` envelope so a thunk resolves to the payload alone.
 *
 * Client errors are raised as {@link ClientErrors}, which the surrounding `catch`
 * routes to `rejectWithValue` — the shape these thunks already produced when
 * `request.ts` threw. A plain value passes through, so a service that does not use
 * the envelope keeps working.
 */
function unwrapServiceResult<TReturn>(result: TReturn | ServiceResult<TReturn>): TReturn {
	if (result == null || typeof result !== 'object') return result as TReturn;
	const envelope = result as { data?: unknown, clientErrors?: unknown };
	if (!Array.isArray(envelope.clientErrors) || !('data' in envelope)) return result as TReturn;
	if (envelope.clientErrors.length > 0) {
		throw new ClientErrors(envelope.clientErrors);
	}
	return envelope.data as TReturn;
}

export function createSchemaThunk<TReturn=void, TArg=void>(
	schemaName: string,
	thunkName: string,
	serviceFn: SchemaReduxActionThunkFn<TReturn, TArg>,
) {
	return createAsyncThunk<TReturn, TArg, { rejectValue: any }>(
		buildThunkName(schemaName, thunkName),
		async (thunkArgs, thunkApi) => {
			const { rejectWithValue } = thunkApi;
			try {
				const schema = await dyn.schemaRegistry.get(schemaName);
				if (!schema) {
					return rejectWithValue(`Schema ${schemaName} not found. Make sure it is registered with schemaRegistry.register().`);
				}
				const result = await serviceFn(schema!, thunkArgs, thunkApi);
				return unwrapServiceResult(result);
			}
			catch (error) {
				if (error instanceof ClientErrors) {
					return rejectWithValue(error);
				}
				return rejectWithValue('Unrecognized error pattern: ' + String(error));
			}
		},
	);
}

export function createThunk<TReturn=any, TArg=any>(
	thunkName: string,
	fn: ReduxActionThunkFn<TReturn, TArg>,
) {
	return createAsyncThunk<TReturn, TArg, { rejectValue: any }>(
		thunkName,
		async (thunkArgs, thunkApi) => {
			const { rejectWithValue } = thunkApi;
			try {
				const result = await fn(thunkArgs, thunkApi);
				return result;
			}
			catch (error) {
				if (error instanceof ClientErrors) {
					return rejectWithValue(error);
				}
				return rejectWithValue(new Error('Unrecognized error pattern: ' + error));
			}
		},
	);
}

export function buildThunkName(sliceName: string, actionName: string, status: string = '') {
	if (status) {
		return `${sliceName}/${actionName}/${status}`;
	}
	return `${sliceName}/${actionName}`;
}