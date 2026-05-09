import { createSlice } from '@reduxjs/toolkit';

import { SLICE_NAME } from './types';
import * as svc from './userContextService';


export { SLICE_NAME };

export type UserContextState = typeof initialState;

const initialState = {
	[svc.getUserContext.stateKey]: svc.getUserContext.initialState,
	isLoading: false,
	error: null,
	data: null,
};

const userContextSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
	},
	extraReducers: (builder) => {
		svc.getUserContext.buildThunkReducers(builder);
	},
});

export const actions = {
	...userContextSlice.actions,
	[svc.getUserContext.stateKey]: svc.getUserContext.thunkAction,
};

export const { reducer } = userContextSlice;