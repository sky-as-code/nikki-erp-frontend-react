import { del, get, post, put, type Options } from '@nikkierp/common';


export type AuthzResourceDto = {
	id: string;
	name: string;
	description?: string;
	resourceType: string;
	resourceRef?: string;
	scopeType: string;
	createdAt: string;
	etag: string;
	actions?: AuthzActionDto[];
	actionsCount?: number;
	[key: string]: unknown;
};

export type AuthzActionDto = {
	id: string;
	name: string;
	description?: string;
	etag: string;
	resourceId: string;
	resourceName?: string;
	createdAt: string;
	createdBy: string;
	entitlementsCount?: number;
	[key: string]: unknown;
};

export type AuthzEntitlementDto = {
	id: string;
	name: string;
	description?: string;
	etag: string;
	actionId?: string;
	resourceId?: string;
	actionExpr: string;
	orgId?: string;
	createdAt: string;
	createdBy: string;
	assignmentsCount?: number;
	rolesCount?: number;
	[key: string]: unknown;
};

export type ListResponse<T> = {
	total: number;
	items: T[];
};

export type ListQuery = {
	page?: number;
	size?: number;
	graph?: Record<string, unknown>;
};

// ============ Resource APIs ============
export async function listResources(
	params?: ListQuery & { withActions?: boolean },
): Promise<ListResponse<AuthzResourceDto>> {
	const options: Options = {};
	if (params) {
		(options as any).searchParams = params;
	}
	return get<ListResponse<AuthzResourceDto>>('authorize/resources', options);
}

export async function getResource(name: string): Promise<AuthzResourceDto> {
	return get<AuthzResourceDto>(`authorize/resources/${name}`);
}

export async function createResource(
	data: Omit<AuthzResourceDto, 'id' | 'createdAt' | 'etag' | 'actions' | 'actionsCount'>,
): Promise<AuthzResourceDto> {
	return post<AuthzResourceDto>('authorize/resources', {
		json: data,
	});
}

export async function updateResource(
	id: string,
	etag: string,
	description?: string | null,
): Promise<AuthzResourceDto> {
	return put<AuthzResourceDto>(`authorize/resources/${id}`, {
		json: { description, etag },
	});
}

export async function deleteResource(name: string): Promise<void> {
	const options: Options = {};
	return del<void>(`authorize/resources/${name}`, options);
}

// ============ Action APIs ============
export async function listActions(
	params?: ListQuery,
): Promise<ListResponse<AuthzActionDto>> {
	const options: Options = {};
	if (params) {
		(options as any).searchParams = params;
	}
	return get<ListResponse<AuthzActionDto>>('authorize/actions', options);
}

export async function getAction(
	actionId: string,
): Promise<AuthzActionDto> {
	return get<AuthzActionDto>(`authorize/actions/${actionId}`);
}

export async function createAction(
	data: Omit<AuthzActionDto, 'id' | 'createdAt' | 'etag' | 'createdBy' | 'entitlementsCount'>,
): Promise<AuthzActionDto> {
	return post<AuthzActionDto>(`authorize/actions`, {
		json: data,
	});
}

export async function updateAction(
	actionId: string,
	data: {etag: string, description?: string },
): Promise<AuthzActionDto> {
	return put<AuthzActionDto>(`authorize/actions/${actionId}`, {
		json: data,
	});
}

export async function deleteAction(
	actionId: string,
): Promise<void> {
	return del<void>(`authorize/actions/${actionId}`);
}

// ============ Entitlement APIs ============
export async function listEntitlements(
	params?: ListQuery,
): Promise<ListResponse<AuthzEntitlementDto>> {
	const options: Options = {};
	if (params) {
		(options as any).searchParams = params;
	}
	return get<ListResponse<AuthzEntitlementDto>>('authorize/entitlements', options);
}

export async function getEntitlement(id: string): Promise<AuthzEntitlementDto> {
	return get<AuthzEntitlementDto>(`authorize/entitlements/${id}`);
}

export async function createEntitlement(
	data: Omit<AuthzEntitlementDto, 'id' | 'createdAt' | 'etag' | 'assignmentsCount' | 'rolesCount'>,
): Promise<AuthzEntitlementDto> {
	return post<AuthzEntitlementDto>('authorize/entitlements', {
		json: data,
	});
}

export async function updateEntitlement(
	id: string,
	etag: string,
	data: { name?: string; description?: string | null },
): Promise<AuthzEntitlementDto> {
	return put<AuthzEntitlementDto>(`authorize/entitlements/${id}`, {
		json: { ...data, etag },
	});
}

export async function deleteEntitlement(id: string): Promise<void> {
	return del<void>(`authorize/entitlements/${id}`);
}
