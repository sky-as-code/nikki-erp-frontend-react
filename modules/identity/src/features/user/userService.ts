import * as request from '@nikkierp/common/request';

import {
	User,
	SearchUserResponse,
	CreateUserRequest,
	CreateUserResponse,
	UpdateUserResponse,
	UpdateUserRequest,
	DeleteUserResponse,
} from './types';


export const userService = {
	async listUsers(scopeRef?: string): Promise<SearchUserResponse> {
		const searchParams: Record<string, string> = {
			withGroups: 'true',
			withHierarchy: 'true',
			withOrgs: 'true',
		};
		if (scopeRef) searchParams.scopeRef = scopeRef;
		const response = await request.get<SearchUserResponse>('identity/users', {
			searchParams,
		});
		return response;
	},

	async getUser(id: string, scopeRef?: string): Promise<User> {
		const searchParams: Record<string, string> = {
			withGroup: 'true',
			withHierarchy: 'true',
			withOrg: 'true',
		};
		if (scopeRef) searchParams.scopeRef = scopeRef;
		const response = await request.get<User>(`identity/users/${id}`, {
			searchParams,
		});
		return response;
	},

	async createUser(data: CreateUserRequest, scopeRef?: string): Promise<CreateUserResponse> {
		const searchParams = scopeRef ? { scopeRef } : undefined;
		const response = await request.post<CreateUserResponse>('identity/users', {
			searchParams,
			json: data,
		});
		return response;
	},

	async updateUser(data: UpdateUserRequest, scopeRef?: string): Promise<UpdateUserResponse> {
		const searchParams = scopeRef ? { scopeRef } : undefined;
		const response = await request.put<UpdateUserResponse>(`identity/users/${data.id}`, {
			searchParams,
			json: data,
		});
		return response;
	},

	async deleteUser(id: string, scopeRef?: string): Promise<DeleteUserResponse> {
		const searchParams = scopeRef ? { scopeRef } : undefined;
		const response = await request.del<DeleteUserResponse>(`identity/users/${id}`, {
			searchParams,
		});
		return response;
	},
};

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