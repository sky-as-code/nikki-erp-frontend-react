import * as request from '@nikkierp/common/request';

import {
	HierarchyLevel,
	SearchHierarchyLevelResponse,
	CreateHierarchyLevelRequest,
	CreateHierarchyLevelResponse,
	UpdateHierarchyLevelRequest,
	UpdateHierarchyLevelResponse,
	ManageHierarchyLevelUsersRequest,
	ManageHierarchyLevelUsersResponse,
	DeleteHierarchyLevelResponse,
} from './types';


export const hierarchyService = {
	async listHierarchies(scopeRef?: string): Promise<SearchHierarchyLevelResponse> {
		const searchParams: Record<string, string> = { withParent: 'true' };
		if (scopeRef) searchParams.scopeRef = scopeRef;
		const response = await request.get<SearchHierarchyLevelResponse>('identity/hierarchy', {
			searchParams,
		});
		return response;
	},

	async createHierarchy(data: CreateHierarchyLevelRequest, scopeRef?: string): Promise<CreateHierarchyLevelResponse> {
		const searchParams = scopeRef ? { scopeRef } : undefined;
		const response = await request.post<CreateHierarchyLevelResponse>('identity/hierarchy', {
			searchParams,
			json: data,
		});
		return response;
	},

	async updateHierarchy(data: UpdateHierarchyLevelRequest, scopeRef?: string): Promise<UpdateHierarchyLevelResponse> {
		const searchParams = scopeRef ? { scopeRef } : undefined;
		const response = await request.put<UpdateHierarchyLevelResponse>(`identity/hierarchy/${data.id}`, {
			searchParams,
			json: data,
		});
		return response;
	},

	async deleteHierarchy(id: string, scopeRef?: string): Promise<DeleteHierarchyLevelResponse> {
		const searchParams = scopeRef ? { scopeRef } : undefined;
		const response = await request.del<DeleteHierarchyLevelResponse>(`identity/hierarchy/${id}`, {
			searchParams,
		});
		return response;
	},

	async getHierarchy(id: string, scopeRef?: string): Promise<HierarchyLevel> {
		const searchParams = scopeRef ? { scopeRef } : undefined;
		const response = await request.get<HierarchyLevel>(`identity/hierarchy/${id}`, {
			searchParams,
		});
		return response;
	},

	async manageHierarchyUsers(
		data: ManageHierarchyLevelUsersRequest,
		scopeRef?: string,
	): Promise<ManageHierarchyLevelUsersResponse> {
		const searchParams = scopeRef ? { scopeRef } : undefined;
		const response = await request.post<ManageHierarchyLevelUsersResponse>(
			`identity/hierarchy/${data.id}/manage-users`,
			{
				searchParams,
				json: data,
			},
		);
		return response;
	},
};