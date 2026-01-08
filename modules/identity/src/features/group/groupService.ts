import * as request from '@nikkierp/common/request';

import {
	Group,
	SearchGroupsResponse,
	CreateGroupRequest,
	CreateGroupResponse,
	UpdateGroupRequest,
	ManageGroupUsersRequest,
	ManageGroupUsersResponse,
} from './types';


export const groupService = {
	async listGroups(orgId: string): Promise<Group[]> {
		const graph = JSON.stringify({
			if: ['org.id', '*', orgId],
			order: [['created_at', 'desc']],
		});
		const response = await request.get<SearchGroupsResponse>('identity/groups', {
			searchParams: { graph },
		});
		return response.items;
	},

	async getGroup(id: string): Promise<Group | undefined> {
		try {
			const response = await request.get<Group>(`identity/groups/${id}`, {
				searchParams: { withUsers: 'true' },
			});
			return response;
		}
		catch (error) {
			console.error('Failed to get group:', error);
			return undefined;
		}
	},

	async createGroup(data: CreateGroupRequest): Promise<CreateGroupResponse> {
		const response = await request.post<CreateGroupResponse>('identity/groups', { json: data });
		return response;
	},

	async updateGroup(id: string, data: UpdateGroupRequest): Promise<Group> {
		const response = await request.put<Group>(`identity/groups/${id}`, { json: data });
		return response;
	},

	async deleteGroup(id: string): Promise<void> {
		await request.del(`identity/groups/${id}`);
	},

	async manageGroupUsers(data: ManageGroupUsersRequest): Promise<ManageGroupUsersResponse> {
		const response = await request.post<ManageGroupUsersResponse>(
			`identity/groups/${data.groupId}/manage-users`,
			{ json: data },
		);
		return response;
	},
};
