import * as dyn from '@nikkierp/common/dynamic_model';
import { ClientErrors } from '@nikkierp/common/types';
import {
	ActionReducerMapBuilder,
	AsyncThunk,
	AsyncThunkConfig,
	AsyncThunkPayloadCreator,
	createAsyncThunk,
	createSelector,
} from '@reduxjs/toolkit';

import { useSmartSelector } from '../microApp';


export type ReduxActionStatus = 'idle' | 'pending' | 'done' | 'error';
type ReduxActionThunkConfig = { rejectValue: any };
export type ReduxActionThunkApi<TReturn = any, TArg = any> =
	Parameters<AsyncThunkPayloadCreator<TReturn, TArg, ReduxActionThunkConfig>>[1];
type ReduxActionThunkFn<TReturn, TArg> =
	(thunkArgs: TArg, thunkApi: ReduxActionThunkApi<TReturn, TArg>) => Promise<TReturn>;
type SchemaReduxActionThunkFn<TReturn, TArg> =
	(schema: dyn.SchemaPack, thunkArgs: TArg, thunkApi: ReduxActionThunkApi<TReturn, TArg>) => Promise<TReturn>;

export interface ReduxThunkState<T =  any> {
	status: ReduxActionStatus;
	error: string | null;
	data: T | null;
	requestId: string | null;
}

export type CrudState<TModel = Record<string, any>> = {
	create: ReduxThunkState<dyn.RestCreateResponse>,
	delete: ReduxThunkState<dyn.RestDeleteResponse>,
	exists: ReduxThunkState<dyn.RestExistsResponse>,
	getOne: ReduxThunkState<dyn.RestGetOneResponse<any>>,
	search: ReduxThunkState<dyn.RestSearchResponse<any>>,
	update: ReduxThunkState<dyn.RestMutateResponse>,
	byId: Record<string, TModel>;
};

export type CrudArchivableState = {
	setIsArchived: ReduxThunkState<dyn.RestMutateResponse>,
};

export type CrudBaseActions = 'setIsArchived' | 'create' | 'delete' | 'exists' | 'getOne' | 'search' | 'update';

export function initCrudState<TModel = Record<string, any>>(): CrudState<TModel> {
	return {
		byId: {},

		create: baseReduxThunkState,
		delete: baseReduxThunkState,
		exists: baseReduxThunkState,
		getOne: baseReduxThunkState,
		search: baseReduxThunkState,
		update: baseReduxThunkState,
	};
}

export function initCrudArchivableState(): CrudArchivableState {
	return {
		setIsArchived: baseReduxThunkState,
	};
};

/** Value returned from {@link ThunkPack.useHook}. */
export type ThunkPackHookReturn<TReturn, TArg> = {
	action: AsyncThunk<TReturn, TArg, { rejectValue: any }>;
	isLoading: boolean;
	isDone: boolean;
	isError: boolean;
	error: string | null;
	data: TReturn | null;
};

export type ThunkPack<TReturn = void, TArg = void, TStateKey extends string = string> = {
	stateKey: TStateKey;
	action: AsyncThunk<TReturn, TArg, { rejectValue: any }>;
	initialState: ReduxThunkState<TReturn>;
	selector: (state: any) => ReduxThunkState<TReturn>;
	resetThunk: (state: any) => void;
	buildThunkReducers: (builder: ActionReducerMapBuilder<any>) => void;
	useHook: () => ThunkPackHookReturn<TReturn, TArg>;
};

export function createSchemaThunkPack<TReturn, TArg, TStateKey extends string>(
	sliceName: string,
	thunkName: TStateKey,
	serviceFn: SchemaReduxActionThunkFn<TReturn, TArg>,
): ThunkPack<TReturn, TArg, TStateKey> {
	const thunk = createSchemaThunk(sliceName, thunkName, serviceFn);
	return buildThunkPack(sliceName, thunkName, thunk);
}

// export function createSchemaThunkPackForSchema<TReturn, TArg, TStateKey extends string>(
// 	sliceName: string,
// 	schemaName: string,
// 	thunkName: TStateKey,
// 	serviceFn: SchemaReduxActionThunkFn<TReturn, TArg>,
// ): ThunkPack<TReturn, TArg, TStateKey> {
// 	const thunk = createSchemaThunk(schemaName, thunkName, serviceFn);
// 	return buildThunkPack(sliceName, thunkName, thunk);
// }

export function createThunkPack<TReturn, TArg, TStateKey extends string>(
	sliceName: string,
	thunkName: TStateKey,
	fn: ReduxActionThunkFn<TReturn, TArg>,
): ThunkPack<TReturn, TArg, TStateKey> {
	const thunk = createThunk(sliceName, thunkName, fn);
	return buildThunkPack(sliceName, thunkName, thunk);
}

function buildThunkPack<TReturn, TArg, TStateKey extends string>(
	sliceName: string,
	stateKey: TStateKey,
	thunk: AsyncThunk<TReturn, TArg, { rejectValue: any }>,
): ThunkPack<TReturn, TArg, TStateKey> {
	const selector = createSelector(
		(rootState: any) => {
			return rootState[sliceName];
		},
		selectThunkStateFactory(stateKey));

	return {
		stateKey,
		action: thunk,
		initialState: baseReduxThunkState,
		selector,
		resetThunk: buildResetThunkReducer(stateKey),
		buildThunkReducers(builder: ActionReducerMapBuilder<any>) {
			buildThunkReducers(builder, thunk, stateKey);
		},
		useHook() {
			const thunkState = useSmartSelector(selector) as ReduxThunkState<TReturn>;
			return {
				action: thunk,
				isLoading: thunkState.status === 'pending',
				isDone: thunkState.status === 'done',
				isError: thunkState.status === 'error',
				error: thunkState.error,
				data: thunkState.data as TReturn | null,
			};
		},
	};
}

function selectThunkStateFactory(stateKey: string) {
	return (sliceState: any) => {
		return sliceState[stateKey] as ReduxThunkState;
	};
}

export const baseReduxThunkState : ReduxThunkState = {
	status: 'idle',
	error: null,
	data: null,
	requestId: null,
};

export function buildResetThunkReducer(actionKey: string) {
	return (state: any) => {
		state[actionKey] = baseReduxThunkState;
	};
}

export function buildThunkReducers<
	TReturn,
	TArg,
	TConfig extends AsyncThunkConfig,
>(
	builder: ActionReducerMapBuilder<any>,
	thunk: AsyncThunk<TReturn, TArg, TConfig>,
	action: string,
) {
	builder
		.addCase(thunk.pending, reducerThunkPending(action))
		.addCase(thunk.fulfilled, reducerThunkDone(action))
		.addCase(thunk.rejected, reducerThunkError(action));
}


function reducerThunkPending(action: string) {
	return (state: {[key: string]: ReduxThunkState}) => {
		state[action].status = 'pending';
		state[action].error = null;
		state[action].data = null;
	};
}

function reducerThunkDone(action: string) {
	return (state: {[key: string]: ReduxThunkState}, param: any) => {
		state[action].status = 'done';
		state[action].data = param.payload;
		state[action].error = null;
	};
}

function reducerThunkError(action: string) {
	return (state: {[key: string]: ReduxThunkState}, param: any) => {
		state[action].status = 'error';
		state[action].error = param.payload || 'Failed to ' + action;
		state[action].data = null;
	};
}

export function createSchemaThunk<TReturn=void, TArg=void>(
	schemaName: string,
	thunkName: string,
	serviceFn: SchemaReduxActionThunkFn<TReturn, TArg>,
) {
	return createAsyncThunk<TReturn, TArg, { rejectValue: any }>(
		`${schemaName}/${thunkName}`,
		async (thunkArgs, thunkApi) => {
			const { rejectWithValue } = thunkApi;
			try {
				const schema = await dyn.schemaRegistry.get(schemaName);
				if (!schema) {
					return rejectWithValue(new Error(`Schema ${schemaName} not found. Make sure it is registered with schemaRegistry.register().`));
				}
				const result = await serviceFn(schema!, thunkArgs, thunkApi);
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

export function createThunk<TReturn=any, TArg=any>(
	sliceName: string,
	thunkName: string,
	fn: ReduxActionThunkFn<TReturn, TArg>,
) {
	return createAsyncThunk<TReturn, TArg, { rejectValue: any }>(
		`${sliceName}/${thunkName}`,
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