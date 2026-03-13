import { mapDtoToUser, mapDtoToGroup, mapDtoToOrg, type User, type Group, type Org } from './types';

import {
	listUsers as listUsersApi,
	listGroups as listGroupsApi,
	listOrgs as listOrgsApi,
} from '@/services/identService';


export const identityService = {
	async listUsers(params?: { graph?: Record<string, unknown>; page?: number; size?: number }): Promise<User[]> {
		const result = await listUsersApi(params);
		return result.items.map(mapDtoToUser);
	},

	async listGroups(params?: { graph?: Record<string, unknown>; page?: number; size?: number }): Promise<Group[]> {
		const result = await listGroupsApi(params);
		return result.items.map(mapDtoToGroup);
	},

	async listOrgs(params?: { graph?: Record<string, unknown>; page?: number; size?: number }): Promise<Org[]> {
		const result = await listOrgsApi(params);
		return result.items.map(mapDtoToOrg);
	},
};

