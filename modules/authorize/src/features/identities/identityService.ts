import {
	listUsers as listUsersApi,
	listGroups as listGroupsApi,
	type IdentityUserDto,
	type IdentityGroupDto,
} from '@/services/identService';

import { mapDtoToUser, mapDtoToGroup, type User, type Group } from './types';


export const identityService = {
	async listUsers(params?: { query?: Record<string, unknown>; page?: number; size?: number }): Promise<User[]> {
		const result = await listUsersApi(params);
		return result.items.map(mapDtoToUser);
	},

	async listGroups(params?: { query?: Record<string, unknown>; page?: number; size?: number }): Promise<Group[]> {
		const result = await listGroupsApi(params);
		return result.items.map(mapDtoToGroup);
	},
};

