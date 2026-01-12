import {
	listUsers as listUsersApi,
	listGroups as listGroupsApi,
	listOrgs as listOrgsApi,
	type IdentityOrgDto,
} from '@/services/identService';

import { mapDtoToUser, mapDtoToGroup, type User, type Group } from './types';

import type { Org } from '@/features/orgs';


function mapDtoToOrg(dto: IdentityOrgDto): Org {
	return {
		id: dto.id,
		displayName: dto.displayName,
		legalName: dto.legalName,
		email: dto.email,
		phoneNumber: dto.phoneNumber,
		address: dto.address,
		status: dto.status,
		slug: dto.slug,
		etag: dto.etag,
		createdAt: dto.createdAt,
		updatedAt: dto.updatedAt,
		deletedAt: dto.deletedAt,
	};
}

export const identityService = {
	async listUsers(params?: { query?: Record<string, unknown>; page?: number; size?: number }): Promise<User[]> {
		const result = await listUsersApi(params);
		return result.items.map(mapDtoToUser);
	},

	async listGroups(params?: { query?: Record<string, unknown>; page?: number; size?: number }): Promise<Group[]> {
		const result = await listGroupsApi(params);
		return result.items.map(mapDtoToGroup);
	},

	async listOrgs(params?: { query?: Record<string, unknown>; page?: number; size?: number }): Promise<Org[]> {
		const result = await listOrgsApi(params);
		return result.items.map(mapDtoToOrg);
	},
};

