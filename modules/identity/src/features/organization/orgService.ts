import * as dyn from '@nikkierp/common/dynamic_model';
import * as uiState from '@nikkierp/ui/appState';

import * as t from './types';
import { ORGANIZATION_SCHEMA_NAME } from '../../constants';


export const createOrg = uiState.createSchemaThunkPack<
	t.CreateOrgResponse, t.CreateOrgRequest, 'createOrg'
>(
	ORGANIZATION_SCHEMA_NAME, 'createOrg',
	async function createOrgThunk(schema: dyn.SchemaPack, request) {
		return schema.restApi.create(request);
	},
);

export const deleteOrg = uiState.createSchemaThunkPack<
	t.DeleteOrgResponse, t.DeleteOrgRequest, 'deleteOrg'
>(
	ORGANIZATION_SCHEMA_NAME, 'deleteOrg',
	async function deleteOrgThunk(schema: dyn.SchemaPack, request) {
		return schema.restApi.delete(request);
	},
);

export const getOrgSchema = uiState.createSchemaThunkPack<
	t.GetOrgSchemaResponse, void, 'getOrgSchema'
>(
	ORGANIZATION_SCHEMA_NAME, 'getOrgSchema',
	async function getOrgSchemaThunk(schema: dyn.SchemaPack) {
		return schema.restApi.getModelSchema();
	},
);

export const getOrgById = uiState.createSchemaThunkPack<
	t.GetOrgResponse, t.GetOrgByIdRequest, 'getOrgById'
>(
	ORGANIZATION_SCHEMA_NAME, 'getOrgById',
	async function getOrgByIdThunk(schema: dyn.SchemaPack, request: t.GetOrgByIdRequest) {
		return schema.restApi.getById(request);
	},
);

export const getOrgBySlug = uiState.createSchemaThunkPack<
	t.GetOrgResponse, t.GetOrgBySlugRequest, 'getOrgBySlug'
>(
	ORGANIZATION_SCHEMA_NAME, 'getOrgBySlug',
	async function getOrgBySlugThunk(schema: dyn.SchemaPack, request: t.GetOrgBySlugRequest) {
		return schema.restApi.getOne(request, (req) => new URLSearchParams({ slug: req.slug }));
	},
);

export const manageOrgUsers = uiState.createSchemaThunkPack<
	t.ManageOrgUsersResponse, t.ManageOrgUsersRequest, 'manageOrgUsers'
>(
	ORGANIZATION_SCHEMA_NAME, 'manageOrgUsers',
	async function manageOrgUsersThunk(schema: dyn.SchemaPack, request) {
		return schema.restApi.manageM2m(request, 'manage-users');
	},
);

export const orgExists = uiState.createSchemaThunkPack<
	t.OrgExistsResponse, t.OrgExistsRequest, 'orgExists'
>(
	ORGANIZATION_SCHEMA_NAME, 'orgExists',
	async function orgExistsThunk(schema: dyn.SchemaPack, request) {
		return schema.restApi.exists(request);
	},
);

export const searchOrgs = uiState.createSchemaThunkPack<
	t.SearchOrgResponse, t.SearchOrgRequest, 'searchOrgs'
>(
	ORGANIZATION_SCHEMA_NAME, 'searchOrgs',
	async function searchOrgsThunk(schema: dyn.SchemaPack, request) {
		return schema.restApi.search(request);
	},
);

export const setOrgIsArchived = uiState.createSchemaThunkPack<
	t.SetOrgIsArchivedResponse, t.SetOrgIsArchivedRequest, 'setOrgIsArchived'
>(
	ORGANIZATION_SCHEMA_NAME, 'setOrgIsArchived',
	async function setOrgIsArchivedThunk(schema: dyn.SchemaPack, request) {
		return schema.restApi.setIsArchived(request);
	},
);

export const updateOrg = uiState.createSchemaThunkPack<
	t.UpdateOrgResponse, t.UpdateOrgRequest, 'updateOrg'
>(
	ORGANIZATION_SCHEMA_NAME, 'updateOrg',
	async function updateOrgThunk(schema: dyn.SchemaPack, request: t.UpdateOrgRequest) {
		return schema.restApi.update(request);
	},
);
