import {
	listUsers as listUsersApi,
	listGroups as listGroupsApi,
	type IdentityUserDto,
	type IdentityGroupDto,
} from '@/services/identService';

import { mapDtoToUser, mapDtoToGroup, type User, type Group } from './types';


export const identityService = {
	async listUsers(): Promise<User[]> {
		const result = await listUsersApi();
		return result.items.map(mapDtoToUser);
	},

	async listGroups(): Promise<Group[]> {
		const result = await listGroupsApi();
		return result.items.map(mapDtoToGroup);
	},
};

