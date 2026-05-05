import { createSlice } from '@reduxjs/toolkit';

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
		resetCreateModule: svc.createModule.resetThunk,
		resetDeleteModule: svc.deleteModule.resetThunk,
		resetGetModule: svc.getModule.resetThunk,
		resetListAllModules: svc.listAllModules.resetThunk,
		resetSearchModules: svc.searchModules.resetThunk,
		resetSetIsArchived: svc.setModuleIsArchived.resetThunk,
		resetUpdateModule: svc.updateModule.resetThunk,
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
	[svc.createModule.stateKey]: svc.createModule.action,
	[svc.deleteModule.stateKey]: svc.deleteModule.action,
	[svc.getModuleSchema.stateKey]: svc.getModuleSchema.action,
	[svc.getModule.stateKey]: svc.getModule.action,
	[svc.listAllModules.stateKey]: svc.listAllModules.action,
	[svc.searchModules.stateKey]: svc.searchModules.action,
	[svc.setModuleIsArchived.stateKey]: svc.setModuleIsArchived.action,
	[svc.moduleExists.stateKey]: svc.moduleExists.action,
	[svc.updateModule.stateKey]: svc.updateModule.action,
};

export const { reducer } = moduleSlice;
