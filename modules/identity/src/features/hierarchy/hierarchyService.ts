import * as request from '@nikkierp/common/request';

import {
	HierarchyLevel,
	SearchHierarchyLevelsResponse,
	CreateHierarchyLevelRequest,
	CreateHierarchyLevelResponse,
	UpdateHierarchyLevelRequest,
	ManageHierarchyUsersRequest,
	ManageHierarchyUsersResponse,
} from './types';


export const hierarchyService = {
	async listHierarchies(orgId: string): Promise<HierarchyLevel[]> {
		const graph = JSON.stringify({
			if: ['org.id', '*', orgId],
			order: [['created_at', 'desc']],
		});
		const response = await request.get<SearchHierarchyLevelsResponse>('identity/hierarchy', {
			searchParams: { withParent: 'true', graph },
		});
		return response.items;
	},

	async createHierarchy(data: CreateHierarchyLevelRequest): Promise<CreateHierarchyLevelResponse> {
		const response = await request.post<CreateHierarchyLevelResponse>('identity/hierarchy', { json: data });
		return response;
	},

	async updateHierarchy(id: string, data: UpdateHierarchyLevelRequest): Promise<HierarchyLevel> {
		const response = await request.put<HierarchyLevel>(`identity/hierarchy/${id}`, { json: data });
		return response;
	},

	async deleteHierarchy(id: string): Promise<void> {
		await request.del(`identity/hierarchy/${id}`);
	},

	async getHierarchy(id: string): Promise<HierarchyLevel | undefined> {
		const response = await request.get<HierarchyLevel>(`identity/hierarchy/${id}`);
		return response;
	},

	async manageHierarchyUsers(data: ManageHierarchyUsersRequest): Promise<ManageHierarchyUsersResponse> {
		const response = await request.post<ManageHierarchyUsersResponse>(
			`identity/hierarchy/${data.hierarchyId}/manage-users`,
			{ json: data },
		);
		return response;
	},
};