import { createSlice, Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import * as svc from './userService';
import { USER_SCHEMA_NAME } from '../../constants';


export const SLICE_NAME = USER_SCHEMA_NAME;

export type UserState = typeof initialState;

export const initialState = {
	[svc.createUser.stateKey]: svc.createUser.initialState,
	[svc.deleteUser.stateKey]: svc.deleteUser.initialState,
	[svc.getUserSchema.stateKey]: svc.getUserSchema.initialState,
	[svc.getUserById.stateKey]: svc.getUserById.initialState,
	[svc.searchUsers.stateKey]: svc.searchUsers.initialState,
	[svc.setUserIsArchived.stateKey]: svc.setUserIsArchived.initialState,
	[svc.userExists.stateKey]: svc.userExists.initialState,
	[svc.updateUser.stateKey]: svc.updateUser.initialState,
};

const userSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		resetCreateUser: svc.createUser.resetThunk,
		resetDeleteUser: svc.deleteUser.resetThunk,
		resetGetUserById: svc.getUserById.resetThunk,
		resetGetUserSchema: svc.getUserSchema.resetThunk,
		resetSearchUsers: svc.searchUsers.resetThunk,
		resetSetUserIsArchived: svc.setUserIsArchived.resetThunk,
		resetUpdateUser: svc.updateUser.resetThunk,
		resetUserExists: svc.userExists.resetThunk,
	},
	extraReducers: (builder) => {
		svc.createUser.buildThunkReducers(builder);
		svc.deleteUser.buildThunkReducers(builder);
		svc.getUserSchema.buildThunkReducers(builder);
		svc.getUserById.buildThunkReducers(builder);
		svc.searchUsers.buildThunkReducers(builder);
		svc.setUserIsArchived.buildThunkReducers(builder);
		svc.userExists.buildThunkReducers(builder);
		svc.updateUser.buildThunkReducers(builder);
	},
});

export const actions = {
	...userSlice.actions,
	[svc.createUser.stateKey]: svc.createUser.action,
	[svc.deleteUser.stateKey]: svc.deleteUser.action,
	[svc.getUserSchema.stateKey]: svc.getUserSchema.action,
	[svc.getUserById.stateKey]: svc.getUserById.action,
	[svc.searchUsers.stateKey]: svc.searchUsers.action,
	[svc.setUserIsArchived.stateKey]: svc.setUserIsArchived.action,
	[svc.userExists.stateKey]: svc.userExists.action,
	[svc.updateUser.stateKey]: svc.updateUser.action,
};

export const { reducer } = userSlice;

export type UserDispatch = ThunkDispatch<
	ReturnType<typeof reducer>,
	undefined,
	UnknownAction
> &
	Dispatch<UnknownAction>;