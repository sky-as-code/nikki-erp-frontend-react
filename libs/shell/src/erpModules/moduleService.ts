import * as dyn from '@nikkierp/common/dynamic_model';
import * as uiState from '@nikkierp/ui/appState';

import { MODULE_SCHEMA_NAME } from '../constants';
import * as t from './types';


export const createModule = uiState.createSchemaThunkPack<t.CreateModuleResponse, t.CreateModuleRequest, 'createModule'>(
	MODULE_SCHEMA_NAME, 'createModule',
	async function createModuleThunk(schema: dyn.SchemaPack, request: t.CreateModuleRequest) {
		return schema.restApi.create(request);
	},
);

export const deleteModule = uiState.createSchemaThunkPack<t.DeleteModuleResponse, t.DeleteModuleRequest, 'deleteModule'>(
	MODULE_SCHEMA_NAME, 'deleteModule',
	async function deleteModuleThunk(schema: dyn.SchemaPack, request: t.DeleteModuleRequest) {
		return schema.restApi.delete(request);
	},
);

export const getModuleSchema = uiState.createSchemaThunkPack<t.GetModuleSchemaResponse, void, 'getModuleSchema'>(
	MODULE_SCHEMA_NAME, 'getModuleSchema',
	async function getModuleSchemaThunk(schema: dyn.SchemaPack) {
		return schema.restApi.getModelSchema();
	},
);

export const getModule = uiState.createSchemaThunkPack<t.GetModuleResponse, t.GetModuleRequest, 'getModule'>(
	MODULE_SCHEMA_NAME, 'getModule',
	async function getModuleThunk(schema: dyn.SchemaPack, request: t.GetModuleRequest) {
		return schema.restApi.getById(request);
	},
);

export const listAllModules = uiState.createSchemaThunkPack<t.SearchModuleResponse, void, 'listAllModules'>(
	MODULE_SCHEMA_NAME, 'listAllModules',
	async function listAllModulesThunk(schema: dyn.SchemaPack) {
		return schema.restApi.search({
			page: 0,
			size: 500,
		});
	},
);

export const searchModules = uiState.createSchemaThunkPack<t.SearchModuleResponse, t.SearchModuleRequest, 'searchModules'>(
	MODULE_SCHEMA_NAME, 'searchModules',
	async function searchModulesThunk(schema: dyn.SchemaPack, request: t.SearchModuleRequest) {
		return schema.restApi.search(request);
	},
);

export const setModuleIsArchived = uiState.createSchemaThunkPack<
	t.SetModuleIsArchivedResponse, t.SetModuleIsArchivedRequest, 'setModuleIsArchived'
>(
	MODULE_SCHEMA_NAME, 'setModuleIsArchived',
	async function setModuleIsArchivedThunk(schema: dyn.SchemaPack, request: t.SetModuleIsArchivedRequest) {
		return schema.restApi.setIsArchived(request);
	},
);

export const moduleExists = uiState.createSchemaThunkPack<t.ModuleExistsResponse, t.ModuleExistsRequest, 'moduleExists'>(
	MODULE_SCHEMA_NAME, 'moduleExists',
	async function moduleExistsThunk(schema: dyn.SchemaPack, request: t.ModuleExistsRequest) {
		return schema.restApi.exists(request);
	},
);

export const updateModule = uiState.createSchemaThunkPack<t.UpdateModuleResponse, t.UpdateModuleRequest, 'updateModule'>(
	MODULE_SCHEMA_NAME, 'updateModule',
	async function updateModuleThunk(schema: dyn.SchemaPack, request: t.UpdateModuleRequest) {
		return schema.restApi.update(request);
	},
);
