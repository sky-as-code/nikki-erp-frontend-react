import { createSelector } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { signInAction, signOutAction, clearSignInErrorAction, AuthState } from './authSlice';
import { UserContextState } from './userContextSlice';

import type { RootState, AppDispatch } from '../appState/store';


const selectAuthData = (state: RootState) => state.shellAuth;
const selectUserContext = (state: RootState) => state.shellUserContext;
const selectFirstOrgSlug = createSelector(
	selectUserContext,
	(userContext: UserContextState) => ({
		slug: userContext.orgs?.[0]?.slug,
		isLoading: userContext.isLoading,
	}),
);
const selectSignInProgress = createSelector(selectAuthData, (state: AuthState) => {
	return state.signInProgress;
});
const selectIsAuthenticated = createSelector(selectAuthData, (state: AuthState) => state.isAuthenticated);

export const useAuthData = () => useSelector(selectAuthData);
export const useSignInProgress = () => useSelector(selectSignInProgress);
export const useIsAuthenticated = () => useSelector(selectIsAuthenticated);

export const useFirstOrgSlug = () => useSelector(selectFirstOrgSlug);
export const useUserContext = () => useSelector(selectUserContext);

// export function useAuthDispatch() {
// 	const dispatch = useDispatch<AppDispatch>();

// 	return {
// 		signIn(credentials: LoginCredentials) {
// 			dispatch(signInAction(credentials));
// 		},
// 		signOut() {
// 			dispatch(signOutAction());
// 		},
// 		clearSignInError() {
// 			dispatch(clearSignInErrorAction());
// 		},
// 	};
// }
