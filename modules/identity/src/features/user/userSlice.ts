import { createSlice, Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

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
	[svc.activateUser.stateKey]: svc.activateUser.initialState,
	[svc.inviteUser.stateKey]: svc.inviteUser.initialState,
	[svc.suspendUser.stateKey]: svc.suspendUser.initialState,
};

const userSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
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
		svc.activateUser.buildThunkReducers(builder);
		svc.inviteUser.buildThunkReducers(builder);
		svc.suspendUser.buildThunkReducers(builder);
	},
});

export const actions = {
	...userSlice.actions,
	[svc.createUser.stateKey]: svc.createUser.thunkAction,
	[svc.deleteUser.stateKey]: svc.deleteUser.thunkAction,
	[svc.getUserSchema.stateKey]: svc.getUserSchema.thunkAction,
	[svc.getUserById.stateKey]: svc.getUserById.thunkAction,
	[svc.searchUsers.stateKey]: svc.searchUsers.thunkAction,
	[svc.setUserIsArchived.stateKey]: svc.setUserIsArchived.thunkAction,
	[svc.userExists.stateKey]: svc.userExists.thunkAction,
	[svc.updateUser.stateKey]: svc.updateUser.thunkAction,
	[svc.activateUser.stateKey]: svc.activateUser.thunkAction,
	[svc.inviteUser.stateKey]: svc.inviteUser.thunkAction,
	[svc.suspendUser.stateKey]: svc.suspendUser.thunkAction,
};

export const { reducer } = userSlice;

export type UserDispatch = ThunkDispatch<
	ReturnType<typeof reducer>,
	undefined,
	UnknownAction
> &
	Dispatch<UnknownAction>;

export function useUserDispatch(): UserDispatch {
	return useDispatch<UserDispatch>();
}