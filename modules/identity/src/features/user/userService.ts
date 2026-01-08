import * as request from '@nikkierp/common/request';

import {
	User,
	SearchUsersResponse,
	CreateUserRequest,
	CreateUserResponse,
	UpdateUserResponse,
	UpdateUserRequest,
} from './types';


export const userService = {
	async listUsers(orgId: string): Promise<User[]> {
		const graph = JSON.stringify({
			if: ['orgs.id', '*', orgId],
			order: [['created_at', 'desc']],
		});
		const response = await request.get<SearchUsersResponse>('identity/users', {
			searchParams: { graph, withGroups: 'true', withHierarchy: 'true' },
		});
		return response.items;
	},

	async listUsersByGroupId(groupId: string): Promise<User[]> {
		const graph = JSON.stringify({
			if: ['groups.id', '*', groupId],
		});

		const response = await request.get<SearchUsersResponse>(`identity/users`, {
			searchParams: { graph },
		});
		return response.items;
	},

	async getUser(id: string): Promise<User | undefined> {
		try {
			const response = await request.get<User>(`identity/users/${id}`, {
				searchParams: { withGroup: 'true', withHierarchy: 'true' },
			});
			return response;
		}
		catch (error) {
			console.error('Failed to get user:', error);
			return undefined;
		}
	},

	async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
		const response = await request.post<CreateUserResponse>('identity/users', { json: data });
		return response;
	},

	async updateUser(id: string, data: Partial<UpdateUserRequest>): Promise<UpdateUserResponse> {
		const response = await request.put<UpdateUserResponse>(`identity/users/${id}`, { json: data });
		return response;
	},

	async deleteUser(id: string): Promise<void> {
		await request.del(`identity/users/${id}`);
	},
};


// const data: User[] = [
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440000',
// 		email: 'john.doe@example.com',
// 		displayName: 'John Wick',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440001',
// 		email: 'jane.smith@example.com',
// 		displayName: 'Jane Smith',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440002',
// 		email: 'michael.johnson@example.com',
// 		displayName: 'Michael Johnson',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440003',
// 		email: 'sarah.williams@example.com',
// 		displayName: 'Sarah Williams',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440004',
// 		email: 'david.brown@example.com',
// 		displayName: 'David Brown',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440005',
// 		email: 'emily.davis@example.com',
// 		displayName: 'Emily Davis',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// ];
// const data: User[] = [
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440000',
// 		email: 'john.doe@example.com',
// 		displayName: 'John Wick',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440001',
// 		email: 'jane.smith@example.com',
// 		displayName: 'Jane Smith',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440002',
// 		email: 'michael.johnson@example.com',
// 		displayName: 'Michael Johnson',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440003',
// 		email: 'sarah.williams@example.com',
// 		displayName: 'Sarah Williams',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440004',
// 		email: 'david.brown@example.com',
// 		displayName: 'David Brown',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// 	{
// 		id: '550e8400-e29b-41d4-a716-446655440005',
// 		email: 'emily.davis@example.com',
// 		displayName: 'Emily Davis',
// 		avatarUrl: '',
// 		status: 'active',
// 	},
// ];