import { del, get, post, put, type Options } from '@nikkierp/common';


export type IdentityUserDto = {
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
	[key: string]: unknown;
};

export type IdentityGroupDto = {
	id: string;
	name: string;
	description?: string;
	etag: string;
	orgId?: string;
	org?: { id: string; displayName: string; slug: string };
	[key: string]: unknown;
};

export type ListResponse<T> = {
	total: number;
	items: T[];
};

export type ListQuery = {
	page?: number;
	size?: number;
	query?: Record<string, unknown>;
	withGroups?: boolean;
	withOrgs?: boolean;
	withHierarchies?: boolean;
	withOrg?: boolean;
};

// ============ User APIs ============
export async function listUsers(params?: ListQuery): Promise<ListResponse<IdentityUserDto>> {
	const options: Options = {};
	if (params) {
		const { query, ...rest } = params;
		(options as any).searchParams = {
			...rest,
			query: query ? JSON.stringify(query) : undefined,
		};
	}
	return get<ListResponse<IdentityUserDto>>('identity/users', options);
}

export async function getUser(id: string, params?: {
	withGroups?: boolean;
	withOrgs?: boolean;
	withHierarchies?: boolean;
}): Promise<IdentityUserDto> {
	const options: Options = {};
	if (params) {
		(options as any).searchParams = params;
	}
	return get<IdentityUserDto>(`identity/users/${id}`, options);
}

export async function createUser(
	data: Omit<IdentityUserDto, 'id' | 'etag' | 'failedLoginAttempts' | 'lastLoginAt' | 'passwordChangedAt' | 'groups' | 'orgs' | 'hierarchies' | 'manager'>,
): Promise<IdentityUserDto> {
	return post<IdentityUserDto>('identity/users', {
		json: data,
	});
}

export async function updateUser(
	id: string,
	data: Partial<IdentityUserDto> & { etag: string },
): Promise<IdentityUserDto> {
	return put<IdentityUserDto>(`identity/users/${id}`, {
		json: data,
	});
}

export async function deleteUser(id: string, params?: { transferredManagerId?: string }): Promise<void> {
	const options: Options = {};
	if (params) {
		(options as any).searchParams = params;
	}
	return del<void>(`identity/users/${id}`, options);
}

// ============ Group APIs ============
export async function listGroups(params?: ListQuery): Promise<ListResponse<IdentityGroupDto>> {
	const options: Options = {};
	if (params) {
		const { query, ...rest } = params;
		(options as any).searchParams = {
			...rest,
			query: query ? JSON.stringify(query) : undefined,
		};
	}
	return get<ListResponse<IdentityGroupDto>>('identity/groups', options);
}

export async function getGroup(id: string, params?: { withOrg?: boolean }): Promise<IdentityGroupDto> {
	const options: Options = {};
	if (params) {
		(options as any).searchParams = params;
	}
	return get<IdentityGroupDto>(`identity/groups/${id}`, options);
}

export async function createGroup(
	data: Omit<IdentityGroupDto, 'id' | 'etag' | 'org'>,
): Promise<IdentityGroupDto> {
	return post<IdentityGroupDto>('identity/groups', {
		json: data,
	});
}

export async function updateGroup(
	id: string,
	data: Partial<IdentityGroupDto> & { etag: string },
): Promise<IdentityGroupDto> {
	return put<IdentityGroupDto>(`identity/groups/${id}`, {
		json: data,
	});
}

export async function deleteGroup(id: string): Promise<void> {
	return del<void>(`identity/groups/${id}`);
}

// ============ Organization APIs ============
export type IdentityOrgDto = {
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
	[key: string]: unknown;
};

export async function listOrgs(params?: ListQuery): Promise<ListResponse<IdentityOrgDto>> {
	const options: Options = {};
	if (params) {
		const { query, ...rest } = params;
		(options as any).searchParams = {
			...rest,
			query: query ? JSON.stringify(query) : undefined,
		};
	}
	return get<ListResponse<IdentityOrgDto>>('identity/organizations', options);
}
