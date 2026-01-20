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
	async listGroups(orgId: string): Promise<SearchGroupsResponse> {
		const graph = JSON.stringify({
			if: ['org.id', '*', orgId],
			order: [['created_at', 'desc']],
		});

		const response = await request.get<SearchGroupsResponse>('identity/groups', {
			searchParams: { graph },
		});
		return response;
	},

	async getGroup(id: string): Promise<Group> {
		const response = await request.get<Group>(`identity/groups/${id}`, {
			searchParams: { withUsers: 'true' },
		});
		return response;
	},

	async createGroup(data: CreateGroupRequest): Promise<CreateGroupResponse> {
		const response = await request.post<CreateGroupResponse>('identity/groups', { json: data });
		return response;
	},

	async updateGroup(data: UpdateGroupRequest): Promise<UpdateGroupResponse> {
		const response = await request.put<UpdateGroupResponse>(`identity/groups/${data.id}`, { json: data });
		return response;
	},

	async deleteGroup(id: string): Promise<DeleteGroupResponse> {
		const response = await request.del<DeleteGroupResponse>(`identity/groups/${id}`);
		return response;
	},

	async manageGroupUsers(data: ManageGroupUsersRequest): Promise<ManageGroupUsersResponse> {
		const response = await request.post<ManageGroupUsersResponse>(
			`identity/groups/${data.id}/manage-users`,
			{ json: data },
		);
		return response;
	},
};
