import { createSlice, Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import * as svc from './groupService';
import { GROUP_SCHEMA_NAME } from '../../constants';


export const SLICE_NAME = GROUP_SCHEMA_NAME;

export type GroupState = typeof initialState;

export const initialState = {
	[svc.createGroup.stateKey]: svc.createGroup.initialState,
	[svc.deleteGroup.stateKey]: svc.deleteGroup.initialState,
	[svc.getGroupById.stateKey]: svc.getGroupById.initialState,
	[svc.getGroupSchema.stateKey]: svc.getGroupSchema.initialState,
	[svc.groupExists.stateKey]: svc.groupExists.initialState,
	[svc.manageGroupUsers.stateKey]: svc.manageGroupUsers.initialState,
	[svc.searchGroups.stateKey]: svc.searchGroups.initialState,
	[svc.updateGroup.stateKey]: svc.updateGroup.initialState,
};

const groupSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
		resetCreateGroup: svc.createGroup.resetThunk,
		resetDeleteGroup: svc.deleteGroup.resetThunk,
		resetGetGroupById: svc.getGroupById.resetThunk,
		resetGetGroupSchema: svc.getGroupSchema.resetThunk,
		resetGroupExists: svc.groupExists.resetThunk,
		resetManageGroupUsers: svc.manageGroupUsers.resetThunk,
		resetSearchGroups: svc.searchGroups.resetThunk,
		resetUpdateGroup: svc.updateGroup.resetThunk,
	},
	extraReducers: (builder) => {
		svc.createGroup.buildThunkReducers(builder);
		svc.deleteGroup.buildThunkReducers(builder);
		svc.getGroupSchema.buildThunkReducers(builder);
		svc.getGroupById.buildThunkReducers(builder);
		svc.groupExists.buildThunkReducers(builder);
		svc.manageGroupUsers.buildThunkReducers(builder);
		svc.searchGroups.buildThunkReducers(builder);
		svc.updateGroup.buildThunkReducers(builder);
	},
});


export const actions = {
	...groupSlice.actions,
	[svc.createGroup.stateKey]: svc.createGroup.action,
	[svc.deleteGroup.stateKey]: svc.deleteGroup.action,
	[svc.getGroupSchema.stateKey]: svc.getGroupSchema.action,
	[svc.getGroupById.stateKey]: svc.getGroupById.action,
	[svc.searchGroups.stateKey]: svc.searchGroups.action,
	[svc.manageGroupUsers.stateKey]: svc.manageGroupUsers.action,
	[svc.updateGroup.stateKey]: svc.updateGroup.action,
};

export const { reducer } = groupSlice;

export type GroupDispatch = ThunkDispatch<
	ReturnType<typeof reducer>,
	undefined,
	UnknownAction
> &
	Dispatch<UnknownAction>;