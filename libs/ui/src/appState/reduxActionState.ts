import * as dyn from '@nikkierp/common/dynamic_model';
import {
	ActionReducerMapBuilder,
	AsyncThunk,
	AsyncThunkConfig,
	AsyncThunkPayloadCreator,
	createAsyncThunk,
} from '@reduxjs/toolkit';


export type ReduxActionStatus = 'idle' | 'pending' | 'success' | 'error';
type ReduxActionThunkConfig = { rejectValue: string };
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
	getOne: ReduxThunkState<dyn.RestGetOneResponse>,
	search: ReduxThunkState<dyn.RestSearchResponse>,
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

export type ThunkPack<TReturn = void, TArg = void, TStateKey extends string = string> = {
	stateKey: TStateKey;
	action: AsyncThunk<TReturn, TArg, { rejectValue: string }>;
	initialState: ReduxThunkState;
	resetThunk: (state: any) => void;
	buildThunkReducers: (builder: ActionReducerMapBuilder<any>) => void;
};

export function createSchemaThunkPack<TReturn, TArg, TStateKey extends string>(
	schemaName: string,
	thunkName: TStateKey,
	serviceFn: SchemaReduxActionThunkFn<TReturn, TArg>,
): ThunkPack<TReturn, TArg, TStateKey> {
	const stateKey = thunkName;
	const thunk = createSchemaThunk(schemaName, thunkName, serviceFn);
	return {
		stateKey,
		action: thunk,
		initialState: baseReduxThunkState,
		resetThunk: buildResetThunkReducer(stateKey),
		buildThunkReducers(builder: ActionReducerMapBuilder<any>) {
			buildThunkReducers(builder, thunk, stateKey);
		},
	};
}

export function createThunkPack<TReturn, TArg, TStateKey extends string>(
	sliceName: string,
	thunkName: TStateKey,
	fn: ReduxActionThunkFn<TReturn, TArg>,
): ThunkPack<TReturn, TArg, TStateKey> {
	const stateKey = thunkName;
	const thunk = createThunk(sliceName, thunkName, fn);
	return {
		stateKey,
		action: thunk,
		initialState: baseReduxThunkState,
		resetThunk: buildResetThunkReducer(stateKey),
		buildThunkReducers(builder: ActionReducerMapBuilder<any>) {
			buildThunkReducers(builder, thunk, stateKey);
		},
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
		.addCase(thunk.fulfilled, reducerThunkSuccess(action))
		.addCase(thunk.rejected, reducerThunkError(action));
}


function reducerThunkPending(action: string) {
	return (state: {[key: string]: ReduxThunkState}) => {
		state[action].status = 'pending';
		state[action].error = null;
		state[action].data = null;
	};
}

function reducerThunkSuccess(action: string) {
	return (state: {[key: string]: ReduxThunkState}, param: any) => {
		state[action].status = 'success';
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
	return createAsyncThunk<TReturn, TArg, { rejectValue: string }>(
		`${schemaName}/${thunkName}`,
		async (thunkArgs, thunkApi) => {
			const { rejectWithValue } = thunkApi;
			try {
				const schema = await dyn.schemaRegistry.get(schemaName);
				const result = await serviceFn(schema!, thunkArgs, thunkApi);
				return result;
			}
			catch (error) {
				const errorMessage = error instanceof Error ? error.message : `Thunk ${schemaName}/${thunkName} failed`;
				return rejectWithValue(errorMessage);
			}
		},
	);
}

export function createThunk<TReturn=any, TArg=any>(
	sliceName: string,
	thunkName: string,
	fn: ReduxActionThunkFn<TReturn, TArg>,
) {
	return createAsyncThunk<TReturn, TArg, { rejectValue: string }>(
		`${sliceName}/${thunkName}`,
		async (thunkArgs, thunkApi) => {
			const { rejectWithValue } = thunkApi;
			try {
				const result = await fn(thunkArgs, thunkApi);
				return result;
			}
			catch (error) {
				const errorMessage = error instanceof Error ? error.message : `Thunk ${sliceName}/${thunkName} failed`;
				return rejectWithValue(errorMessage);
			}
		},
	);
}