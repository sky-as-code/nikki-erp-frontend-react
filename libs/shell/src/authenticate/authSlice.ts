import { createSlice } from '@reduxjs/toolkit';

import * as svc from './authService';
import { SLICE_NAME } from './types';


export { SLICE_NAME };

export type AuthState = typeof initialState;

export const initialState = {
	[svc.startSignIn.stateKey]: svc.startSignIn.initialState,
	[svc.continueSignIn.stateKey]: svc.continueSignIn.initialState,
	[svc.signOut.stateKey]: svc.signOut.initialState,
	[svc.restoreAuthSession.stateKey]: svc.restoreAuthSession.initialState,
	// isLoading: false,
	// isAuthenticated: false,
};

const authSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		resetStartSignIn: svc.startSignIn.resetThunk,
		resetContinueSignIn: svc.continueSignIn.resetThunk,
		resetSignOut: svc.signOut.resetThunk,
		resetRestoreAuthSession: svc.restoreAuthSession.resetThunk,
	},
	extraReducers: (builder) => {
		svc.startSignIn.buildThunkReducers(builder);
		svc.continueSignIn.buildThunkReducers(builder);
		svc.signOut.buildThunkReducers(builder);
		svc.restoreAuthSession.buildThunkReducers(builder);

		// builder.addMatcher(
		// 	(action: UnknownAction): boolean => {
		// 		return typeof action.type === 'string' && action.type.endsWith('/pending');
		// 	},
		// 	(state) => {
		// 		state.isLoading = true;
		// 	});

		// builder.addMatcher(
		// 	(action: any): action is SignInResult => {
		// 		return typeof action.type === 'string' && action.type.endsWith(`${svc.continueSignIn.stateKey}/fulfilled`);
		// 	},
		// 	(state) => {
		// 		state.isLoading = false;
		// 		state.isAuthenticated = true;
		// 	});
	},
});

export const actions = {
	...authSlice.actions,
	[svc.startSignIn.stateKey]: svc.startSignIn.action,
	[svc.continueSignIn.stateKey]: svc.continueSignIn.action,
	[svc.signOut.stateKey]: svc.signOut.action,
	[svc.restoreAuthSession.stateKey]: svc.restoreAuthSession.action,
};

export const { reducer } = authSlice;
