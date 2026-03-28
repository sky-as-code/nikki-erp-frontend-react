
import { mapDtoToIdentityUser } from './types';

import type { IdentityUser } from './types';

import { listUsers as listUsersApi } from '@/services/identService';


type ListUsersParams = {
	graph?: Record<string, unknown>;
	page?: number;
	size?: number;
};

export const identityService = {
	async listUsers(params?: ListUsersParams): Promise<IdentityUser[]> {
		const result = await listUsersApi(params);
		return result.items.map(mapDtoToIdentityUser);
	},
};

