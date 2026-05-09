import { createSlice, Dispatch, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

import * as svc from './moduleService';
import { MODULE_SCHEMA_NAME } from '../constants';


export const SLICE_NAME = MODULE_SCHEMA_NAME;

export type ModuleState = typeof initialState;

export const initialState = {
	[svc.createModule.stateKey]: svc.createModule.initialState,
	[svc.deleteModule.stateKey]: svc.deleteModule.initialState,
	[svc.getModuleSchema.stateKey]: svc.getModuleSchema.initialState,
	[svc.getModule.stateKey]: svc.getModule.initialState,
	[svc.listAllModules.stateKey]: svc.listAllModules.initialState,
	[svc.searchModules.stateKey]: svc.searchModules.initialState,
	[svc.setModuleIsArchived.stateKey]: svc.setModuleIsArchived.initialState,
	[svc.moduleExists.stateKey]: svc.moduleExists.initialState,
	[svc.updateModule.stateKey]: svc.updateModule.initialState,
};

const moduleSlice = createSlice({
	name: SLICE_NAME,
	initialState,
	reducers: {
	},
	extraReducers: (builder) => {
		svc.createModule.buildThunkReducers(builder);
		svc.deleteModule.buildThunkReducers(builder);
		svc.getModuleSchema.buildThunkReducers(builder);
		svc.getModule.buildThunkReducers(builder);
		svc.listAllModules.buildThunkReducers(builder);
		svc.searchModules.buildThunkReducers(builder);
		svc.setModuleIsArchived.buildThunkReducers(builder);
		svc.moduleExists.buildThunkReducers(builder);
		svc.updateModule.buildThunkReducers(builder);
	},
});

export const actions = {
	...moduleSlice.actions,
	[svc.createModule.stateKey]: svc.createModule.thunkAction,
	[svc.deleteModule.stateKey]: svc.deleteModule.thunkAction,
	[svc.getModuleSchema.stateKey]: svc.getModuleSchema.thunkAction,
	[svc.getModule.stateKey]: svc.getModule.thunkAction,
	[svc.listAllModules.stateKey]: svc.listAllModules.thunkAction,
	[svc.searchModules.stateKey]: svc.searchModules.thunkAction,
	[svc.setModuleIsArchived.stateKey]: svc.setModuleIsArchived.thunkAction,
	[svc.moduleExists.stateKey]: svc.moduleExists.thunkAction,
	[svc.updateModule.stateKey]: svc.updateModule.thunkAction,
};

export const { reducer } = moduleSlice;

export type ModuleDispatch = ThunkDispatch<
	ReturnType<typeof reducer>,
	undefined,
	UnknownAction
> &
	Dispatch<UnknownAction>;