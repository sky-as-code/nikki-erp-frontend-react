import * as uiState from '@nikkierp/ui/appState';
import { createSlice } from '@reduxjs/toolkit';

import * as svc from './userService';
import { USER_SCHEMA_NAME } from '../../constants';


export const SLICE_NAME = USER_SCHEMA_NAME;

export type UserState = uiState.CrudState & uiState.CrudArchivableState;

export const initialState: UserState = {
	...uiState.initCrudState(),
	...uiState.initCrudArchivableState(),
};

const userSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		resetSetIsArchived: uiState.baseAction.reducerResetState('setIsArchived'),
		resetCreateUser: uiState.baseAction.reducerResetState('create'),
		resetDeleteUser: uiState.baseAction.reducerResetState('delete'),
		resetGetUser: uiState.baseAction.reducerResetState('getOne'),
		resetSearchUsers: uiState.baseAction.reducerResetState('search'),
		resetUpdateUser: uiState.baseAction.reducerResetState('update'),
	},
	extraReducers: (builder) => {
		uiState.buildActionReducer(builder, svc.createUser, 'create');
		uiState.buildActionReducer(builder, svc.deleteUser, 'delete');
		uiState.buildActionReducer(builder, svc.getUser, 'getOne');
		uiState.buildActionReducer(builder, svc.searchUsers, 'search');
		uiState.buildActionReducer(builder, svc.setUserIsArchived, 'setIsArchived');
		uiState.buildActionReducer(builder, svc.userExists, 'exists');
		uiState.buildActionReducer(builder, svc.updateUser, 'update');
	},
});

export const actions = {
	...userSlice.actions,
	createUser: svc.createUser,
	deleteUser: svc.deleteUser,
	getUser: svc.getUser,
	searchUsers: svc.searchUsers,
	setUserIsArchived: svc.setUserIsArchived,
	userExists: svc.userExists,
	updateUser: svc.updateUser,
};

export const { reducer } = userSlice;
