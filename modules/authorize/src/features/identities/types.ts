import type { IdentityUserDto, IdentityGroupDto, IdentityOrgDto } from '@/services/identService';


export type User = {
	id: string;
	displayName: string;
	email: string;
	avatarUrl?: string;
	etag: string;
	failedLoginAttempts?: number;
	hierarchyId?: string;
	lastLoginAt?: string;
	lockedUntil?: string;
	mustChangePassword?: boolean;
	passwordChangedAt?: string;
	status: 'active' | 'inactive' | 'lock';
	managerId?: string;
	groups?: Array<{ id: string; name: string }>;
	orgs?: Array<{ id: string; displayName: string; slug: string }>;
	hierarchies?: Array<{ id: string; name: string }>;
	manager?: { id: string; displayName: string };
};

export type Group = {
	id: string;
	name: string;
	description?: string;
	etag: string;
	orgId?: string;
	org?: { id: string; displayName: string; slug: string };
};

export interface Org {
	id: string;
	displayName: string;
	legalName?: string;
	email?: string;
	phoneNumber?: string;
	address?: string;
	status: 'active' | 'archived';
	slug: string;
	etag?: string;
	createdAt?: string;
	updatedAt?: string;
	deletedAt?: string;
}

export function mapDtoToUser(dto: IdentityUserDto): User {
	return {
		id: dto.id,
		displayName: dto.displayName,
		email: dto.email,
		avatarUrl: dto.avatarUrl,
		etag: dto.etag,
		failedLoginAttempts: dto.failedLoginAttempts,
		hierarchyId: dto.hierarchyId,
		lastLoginAt: dto.lastLoginAt,
		lockedUntil: dto.lockedUntil,
		mustChangePassword: dto.mustChangePassword,
		passwordChangedAt: dto.passwordChangedAt,
		status: dto.status as User['status'],
		managerId: dto.managerId,
		groups: dto.groups,
		orgs: dto.orgs,
		hierarchies: dto.hierarchies,
		manager: dto.manager,
	};
}

export function mapDtoToGroup(dto: IdentityGroupDto): Group {
	return {
		id: dto.id,
		name: dto.name,
		description: dto.description,
		etag: dto.etag,
		orgId: dto.orgId,
		org: dto.org,
	};
}

export function mapDtoToOrg(dto: IdentityOrgDto): Org {
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

export type { Org as Organization };
