import * as dyn from '@nikkierp/common/dynamic_model';
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
import { UseSelector } from 'react-redux';

import { useSmartSelector, UseStateSelectorFn } from '../microApp';


export type ReduxActionStatus = 'idle' | 'pending' | 'done' | 'error';
type ReduxActionThunkConfig = { rejectValue: any };
export type ReduxActionThunkApi<TReturn = any, TArg = any> =
	Parameters<AsyncThunkPayloadCreator<TReturn, TArg, ReduxActionThunkConfig>>[1];
type ReduxActionThunkFn<TReturn, TArg> =
	(thunkArgs: TArg, thunkApi: ReduxActionThunkApi<TReturn, TArg>) => Promise<TReturn>;
type SchemaReduxActionThunkFn<TReturn, TArg> =
	(schema: dyn.SchemaPack, thunkArgs: TArg, thunkApi: ReduxActionThunkApi<TReturn, TArg>) => Promise<TReturn>;

export interface ReduxThunkState<T =  any> {
	// status: ReduxActionStatus;
	isLoading: boolean;
	isDone: boolean;
	isError: boolean;
	error: string | null;
	data: T | null;
	requestId: string | null;
}

// export type CrudState<TModel = Record<string, any>> = {
// 	create: ReduxThunkState<dyn.RestCreateResponse>,
// 	delete: ReduxThunkState<dyn.RestDeleteResponse>,
// 	exists: ReduxThunkState<dyn.RestExistsResponse>,
// 	getOne: ReduxThunkState<dyn.RestGetOneResponse<any>>,
// 	search: ReduxThunkState<dyn.RestSearchResponse<any>>,
// 	update: ReduxThunkState<dyn.RestMutateResponse>,
// 	byId: Record<string, TModel>;
// };

// export type CrudArchivableState = {
// 	setIsArchived: ReduxThunkState<dyn.RestMutateResponse>,
// };

// export type CrudBaseActions = 'setIsArchived' | 'create' | 'delete' | 'exists' | 'getOne' | 'search' | 'update';

// export function initCrudState<TModel = Record<string, any>>(): CrudState<TModel> {
// 	return {
// 		byId: {},

// 		create: baseReduxThunkState,
// 		delete: baseReduxThunkState,
// 		exists: baseReduxThunkState,
// 		getOne: baseReduxThunkState,
// 		search: baseReduxThunkState,
// 		update: baseReduxThunkState,
// 	};
// }

// export function initCrudArchivableState(): CrudArchivableState {
// 	return {
// 		setIsArchived: baseReduxThunkState,
// 	};
// };

export type ThunkPackHookReturn<TReturn, TArg> = {
	thunkAction: AsyncThunk<TReturn, TArg, { rejectValue: any }>;
	resetAction: ActionCreatorWithoutPayload<string>;
	isLoading: boolean;
	isDone: boolean;
	isError: boolean;
	error: string | null;
	data: TReturn | null;
};

export type ThunkPack<TReturn = void, TArg = void, TStateKey extends string = string> = {
	stateKey: TStateKey,
	thunkAction: AsyncThunk<TReturn, TArg, { rejectValue: any }>,
	resetAction: ActionCreatorWithoutPayload<string>,
	initialState: ReduxThunkState<TReturn>,
	selector: (state: any) => ReduxThunkState<TReturn>,
	buildThunkReducers: (builder: ActionReducerMapBuilder<any>) => void,
	useHook: (useSelectorFn: ThunkPackUseSelectorFn) => ThunkPackHookReturn<TReturn, TArg>,
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
		useHook(useSelectorFn: ThunkPackUseSelectorFn) {
			// How to detect the caller is from shell or micro-app?
			const thunkState = (useSelectorFn as any)(selector) as ReduxThunkState<TReturn>;
			return {
				thunkAction: thunk,
				resetAction,
				isLoading: thunkState.isLoading,
				isDone: thunkState.isDone,
				isError: thunkState.isError,
				error: thunkState.error,
				data: thunkState.data as TReturn | null,
			};
		},
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

function buildThunkName(sliceName: string, actionName: string, status: string = '') {
	if (status) {
		return `${sliceName}/${actionName}/${status}`;
	}
	return `${sliceName}/${actionName}`;
}