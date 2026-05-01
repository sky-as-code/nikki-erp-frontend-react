import { createSlice } from '@reduxjs/toolkit';

import * as svc from './userService';
import { USER_SCHEMA_NAME } from '../../constants';


export const SLICE_NAME = USER_SCHEMA_NAME;

export type UserState = typeof initialState;

export const initialState = {
	[svc.createUser.stateKey]: svc.createUser.initialState,
	[svc.deleteUser.stateKey]: svc.deleteUser.initialState,
	[svc.getUser.stateKey]: svc.getUser.initialState,
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
		resetGetUser: svc.getUser.resetThunk,
		resetSearchUsers: svc.searchUsers.resetThunk,
		resetSetIsArchived: svc.setUserIsArchived.resetThunk,
		resetUpdateUser: svc.updateUser.resetThunk,
	},
	extraReducers: (builder) => {
		svc.createUser.buildThunkReducers(builder);
		svc.deleteUser.buildThunkReducers(builder);
		svc.getUser.buildThunkReducers(builder);
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
	[svc.getUser.stateKey]: svc.getUser.action,
	[svc.searchUsers.stateKey]: svc.searchUsers.action,
	[svc.setUserIsArchived.stateKey]: svc.setUserIsArchived.action,
	[svc.userExists.stateKey]: svc.userExists.action,
	[svc.updateUser.stateKey]: svc.updateUser.action,
};

export const { reducer } = userSlice;
