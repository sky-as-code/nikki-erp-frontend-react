import * as request from '@nikkierp/common/request';

import {
	Group,
	SearchGroupsResponse,
	CreateGroupRequest,
	CreateGroupResponse,
	UpdateGroupRequest,
	UpdateGroupResponse,
	ManageGroupUsersRequest,
	ManageGroupUsersResponse,
	DeleteGroupResponse,
} from './types';


export const groupService = {
	async listGroups(scopeRef?: string): Promise<SearchGroupsResponse> {
		const searchParams = scopeRef ? { scopeRef } : undefined;
		const response = await request.get<SearchGroupsResponse>('identity/groups', {
			searchParams,
		});
		return response;
	},

	async getGroup(id: string, scopeRef?: string): Promise<Group> {
		const searchParams: Record<string, string> = { withUsers: 'true' };
		if (scopeRef) searchParams.scopeRef = scopeRef;
		const response = await request.get<Group>(`identity/groups/${id}`, {
			searchParams,
		});
		return response;
	},

	async createGroup(data: CreateGroupRequest, scopeRef?: string): Promise<CreateGroupResponse> {
		const searchParams = scopeRef ? { scopeRef } : undefined;
		const response = await request.post<CreateGroupResponse>('identity/groups', {
			searchParams,
			json: data,
		});
		return response;
	},

	async updateGroup(data: UpdateGroupRequest, scopeRef?: string): Promise<UpdateGroupResponse> {
		const searchParams = scopeRef ? { scopeRef } : undefined;
		const response = await request.put<UpdateGroupResponse>(`identity/groups/${data.id}`, {
			searchParams,
			json: data,
		});
		return response;
	},

	async deleteGroup(id: string, scopeRef?: string): Promise<DeleteGroupResponse> {
		const searchParams = scopeRef ? { scopeRef } : undefined;
		const response = await request.del<DeleteGroupResponse>(`identity/groups/${id}`, {
			searchParams,
		});
		return response;
	},

	async manageGroupUsers(data: ManageGroupUsersRequest, scopeRef?: string): Promise<ManageGroupUsersResponse> {
		const searchParams = scopeRef ? { scopeRef } : undefined;
		const response = await request.post<ManageGroupUsersResponse>(
			`identity/groups/${data.id}/manage-users`,
			{
				searchParams,
				json: data,
			},
		);
		return response;
	},
};
