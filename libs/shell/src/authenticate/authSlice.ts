import { createSlice, Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import * as svc from './authService';
import { SLICE_NAME } from './types';


export { SLICE_NAME };

export type AuthState = typeof initialState;

export const initialState = {
	[svc.startSignIn.stateKey]: svc.startSignIn.initialState,
	[svc.continueSignIn.stateKey]: svc.continueSignIn.initialState,
	[svc.signOut.stateKey]: svc.signOut.initialState,
	[svc.restoreAuthSession.stateKey]: svc.restoreAuthSession.initialState,
	[svc.settleSession.stateKey]: svc.settleSession.initialState,
};

const authSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
	},
	extraReducers: (builder) => {
		svc.startSignIn.buildThunkReducers(builder);
		svc.continueSignIn.buildThunkReducers(builder);
		svc.signOut.buildThunkReducers(builder);
		svc.restoreAuthSession.buildThunkReducers(builder);
		svc.settleSession.buildThunkReducers(builder);

		builder.addMatcher(
			(action: UnknownAction): boolean => {
				return typeof action.type === 'string' && action.type.startsWith(SLICE_NAME);
			},
			(state) => {
				// state.isLoading = true;
			});

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
	[svc.startSignIn.stateKey]: svc.startSignIn.thunkAction,
	[svc.continueSignIn.stateKey]: svc.continueSignIn.thunkAction,
	[svc.signOut.stateKey]: svc.signOut.thunkAction,
	[svc.restoreAuthSession.stateKey]: svc.restoreAuthSession.thunkAction,
	[svc.settleSession.stateKey]: svc.settleSession.thunkAction,
};

export const { reducer } = authSlice;

export type AuthDispatch = ThunkDispatch<
	ReturnType<typeof reducer>,
	undefined,
	UnknownAction
> &
	Dispatch<UnknownAction>;

export function useAuthDispatch(): AuthDispatch {
	return useDispatch<AuthDispatch>();
}
