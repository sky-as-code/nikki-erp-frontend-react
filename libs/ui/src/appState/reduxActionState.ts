import * as dyn from '@nikkierp/common/dynamic_model';
import {
	ActionReducerMapBuilder, AsyncThunk, AsyncThunkConfig, createAsyncThunk, createSlice, PayloadAction,
} from '@reduxjs/toolkit';


export type ReduxActionStatus = 'idle' | 'pending' | 'success' | 'error';

export interface ReduxActionState<T =  any> {
	status: ReduxActionStatus;
	error: string | null;
	data: T | null;
	requestId: string | null;
}

export type CrudState<TModel = Record<string, any>> = {
	create: ReduxActionState<dyn.RestCreateResponse>,
	delete: ReduxActionState<dyn.RestDeleteResponse>,
	exists: ReduxActionState<dyn.RestExistsResponse>,
	getOne: ReduxActionState<dyn.RestGetOneResponse>,
	search: ReduxActionState<dyn.RestSearchResponse>,
	update: ReduxActionState<dyn.RestMutateResponse>,
	byId: Record<string, TModel>;
};

export type CrudArchivableState = {
	setIsArchived: ReduxActionState<dyn.RestMutateResponse>,
};

export type CrudBaseActions = 'setIsArchived' | 'create' | 'delete' | 'exists' | 'getOne' | 'search' | 'update';

export function initCrudState<TModel = Record<string, any>>(): CrudState<TModel> {
	return {
		byId: {},

		create: baseReduxActionState,
		delete: baseReduxActionState,
		exists: baseReduxActionState,
		getOne: baseReduxActionState,
		search: baseReduxActionState,
		update: baseReduxActionState,
	};
}

export function initCrudArchivableState(): CrudArchivableState {
	return {
		setIsArchived: baseReduxActionState,
	};
};

export const baseReduxActionState : ReduxActionState = {
	status: 'idle',
	error: null,
	data: null,
	requestId: null,
};

export const baseAction = {
	state: baseReduxActionState,
	reducerResetState: (action: CrudBaseActions) => (state: any) => {
		state[action] = baseReduxActionState;
	},
};

export function buildActionReducer<
	Returned,
	ThunkArg,
	ThunkApiConfig extends AsyncThunkConfig,
>(
	builder: ActionReducerMapBuilder<any>,
	thunk: AsyncThunk<Returned, ThunkArg, ThunkApiConfig>,
	action: CrudBaseActions,
) {
	builder
		.addCase(thunk.pending, reducerActionPending(action))
		.addCase(thunk.fulfilled, reducerActionSuccess(action))
		.addCase(thunk.rejected, reducerActionError(action));
}


function reducerActionPending(action: CrudBaseActions) {
	return (state: any) => {
		state[action].status = 'pending';
		state[action].error = null;
		state[action].data = null;
	};
}

function reducerActionSuccess(action: CrudBaseActions) {
	return (state: any, param: any) => {
		state[action].status = 'success';
		state[action].data = param.payload;
		state[action].error = null;
	};
}

function reducerActionError(action: CrudBaseActions) {
	return (state: any, param: any) => {
		state[action].status = 'error';
		state[action].error = param.payload || 'Failed to ' + action;
		state[action].data = null;
	};
}

export function createActionThunk<TReturn=any, TArg=any>(
	schemaName: string,
	thunkName: string,
	serviceFn: (schema: dyn.SchemaPack, thunkArgs: TArg) => Promise<TReturn>,
) {
	return createAsyncThunk<TReturn, TArg, { rejectValue: string }>(
		`${schemaName}/${thunkName}`,
		async (thunkArgs, { rejectWithValue }) => {
			try {
				const schema = await dyn.schemaRegistry.get(schemaName);
				const result = await serviceFn(schema!, thunkArgs);
				return result;
			}
			catch (error) {
				const errorMessage = error instanceof Error ? error.message : `Thunk ${schemaName}/${thunkName} failed`;
				return rejectWithValue(errorMessage);
			}
		},
	);
}