import { CommandResponse, fail, ok } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';

import * as t from './types';
import { ORGANIZATION_SCHEMA_NAME } from '../../constants';


type OrgServiceResult<TData> = Promise<CommandResponse<TData, unknown>>;

async function withOrgSchema<TData>(fn: (schema: dyn.SchemaPack) => Promise<TData>): OrgServiceResult<TData> {
	try {
		return ok(await dyn.withSchema(ORGANIZATION_SCHEMA_NAME, fn));
	}
	catch (error) {
		return fail(error);
	}
}

export function createOrg(request: t.CreateOrgRequest): OrgServiceResult<t.CreateOrgResponse> {
	return withOrgSchema(schema => schema.restApi.create(request));
}

export function deleteOrg(request: t.DeleteOrgRequest): OrgServiceResult<t.DeleteOrgResponse> {
	return withOrgSchema(schema => schema.restApi.delete(request));
}

export function getOrgSchema(): OrgServiceResult<t.GetOrgSchemaResponse> {
	return withOrgSchema(schema => schema.restApi.getModelSchema());
}

export function getOrgById(request: t.GetOrgByIdRequest): OrgServiceResult<t.GetOrgResponse> {
	return withOrgSchema(schema => schema.restApi.getById(request));
}

export function getOrgBySlug(request: t.GetOrgBySlugRequest): OrgServiceResult<t.GetOrgResponse> {
	return withOrgSchema(schema => schema.restApi.getOne(request, (req) => new URLSearchParams({ slug: req.slug })));
}

export function manageOrgUsers(request: t.ManageOrgUsersRequest): OrgServiceResult<t.ManageOrgUsersResponse> {
	return withOrgSchema(schema => schema.restApi.manageM2m(request, 'manage-users'));
}

export function orgExists(request: t.OrgExistsRequest): OrgServiceResult<t.OrgExistsResponse> {
	return withOrgSchema(schema => schema.restApi.exists(request));
}

export function searchOrgs(request: t.SearchOrgRequest): OrgServiceResult<t.SearchOrgResponse> {
	return withOrgSchema(schema => schema.restApi.search(request));
}

export function setOrgIsArchived(
	request: t.SetOrgIsArchivedRequest,
): OrgServiceResult<t.SetOrgIsArchivedResponse> {
	return withOrgSchema(schema => schema.restApi.setIsArchived(request));
}

export function updateOrg(request: t.UpdateOrgRequest): OrgServiceResult<t.UpdateOrgResponse> {
	return withOrgSchema(schema => schema.restApi.update(request));
}
