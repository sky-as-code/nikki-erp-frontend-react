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
	async listHierarchies(orgId: string): Promise<SearchHierarchyLevelResponse> {
		const graph = JSON.stringify({
			if: ['org.id', '*', orgId],
			order: [['created_at', 'desc']],
		});
		const response = await request.get<SearchHierarchyLevelResponse>('identity/hierarchy', {
			searchParams: { withParent: 'true', graph },
		});
		return response;
	},

	async createHierarchy(data: CreateHierarchyLevelRequest): Promise<CreateHierarchyLevelResponse> {
		const response = await request.post<CreateHierarchyLevelResponse>('identity/hierarchy', { json: data });
		return response;
	},

	async updateHierarchy(data: UpdateHierarchyLevelRequest): Promise<UpdateHierarchyLevelResponse> {
		const response = await request.put<UpdateHierarchyLevelResponse>(`identity/hierarchy/${data.id}`, { json: data });
		return response;
	},

	async deleteHierarchy(id: string): Promise<DeleteHierarchyLevelResponse> {
		const response = await request.del<DeleteHierarchyLevelResponse>(`identity/hierarchy/${id}`);
		return response;
	},

	async getHierarchy(id: string): Promise<HierarchyLevel> {
		const response = await request.get<HierarchyLevel>(`identity/hierarchy/${id}`);
		return response;
	},

	async manageHierarchyUsers(data: ManageHierarchyLevelUsersRequest): Promise<ManageHierarchyLevelUsersResponse> {
		const response = await request.post<ManageHierarchyLevelUsersResponse>(
			`identity/hierarchy/${data.id}/manage-users`,
			{ json: data },
		);
		return response;
	},
};