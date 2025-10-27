import { createSelector } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { signInAction, signOutAction, clearSignInErrorAction } from './authSlice';
import { UserContextState } from './userContextSlice';

import type { LoginCredentials } from './authSlice';
import type { RootState, AppDispatch } from '../../redux/store';


const selectAuthData = (state: RootState) => state.shellAuth;
const selectUserContext = (state: RootState) => state.shellUserContext;
const selectFirstOrgSlug = createSelector(
	selectUserContext,
	(userContext: UserContextState) => ({
		slug: userContext.orgs?.[0]?.slug,
		isLoading: userContext.isLoading,
	}),
);

export const useAuthData = () => useSelector(selectAuthData);
export const useFirstOrgSlug = () => useSelector(selectFirstOrgSlug);
export const useUserContext = () => useSelector(selectUserContext);

export const useAuthDispatch = () => {
	const dispatch = useDispatch<AppDispatch>();

	return {
		signIn(credentials: LoginCredentials) {
			dispatch(signInAction(credentials));
		},
		signOut() {
			dispatch(signOutAction());
		},
		clearSignInError() {
			dispatch(clearSignInErrorAction());
		},
	};
};
