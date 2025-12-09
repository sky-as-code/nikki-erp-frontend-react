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

// ============ Role APIs ============
export type AuthzRoleDto = {
	id: string;
	name: string;
	description?: string;
	ownerType: string;
	ownerRef: string;
	isRequestable: boolean;
	isRequiredAttachment: boolean;
	isRequiredComment: boolean;
	orgId?: string;
	createdAt: string;
	createdBy: string;
	etag?: string;
	entitlements?: AuthzEntitlementDto[];
	entitlementsCount?: number;
	[key: string]: unknown;
};

export async function listRoles(
	params?: ListQuery,
): Promise<ListResponse<AuthzRoleDto>> {
	const options: Options = {};
	// if (params) {
	// 	(options as any).searchParams = params;
	// }

	const defaultParams: ListQuery = {
		graph: {
			order: [['id', 'asc']],
		},
	};

	const finalParams = {
		...defaultParams,
		...params,
	};

	const { graph, ...rest } = finalParams;

	(options as any).searchParams = {
		...rest,
		graph: graph ? JSON.stringify(graph) : undefined,
	};

	return get<ListResponse<AuthzRoleDto>>('authorize/roles', options);
}


export async function getRole(id: string): Promise<AuthzRoleDto> {
	return get<AuthzRoleDto>(`authorize/roles/${id}`);
}

export async function createRole(
	data: Omit<AuthzRoleDto, 'id' | 'createdAt' | 'etag' | 'entitlementsCount' | 'entitlements'>,
): Promise<AuthzRoleDto> {
	return post<AuthzRoleDto>('authorize/roles', {
		json: data,
	});
}

export async function updateRole(
	id: string,
	etag: string,
	data: { name?: string; description?: string | null },
): Promise<AuthzRoleDto> {
	return put<AuthzRoleDto>(`authorize/roles/${id}`, {
		json: { ...data, etag },
	});
}

export async function deleteRole(id: string): Promise<void> {
	return del<void>(`authorize/roles/${id}`);
}

export type EntitlementAssignmentInput = {
	entitlementId: string;
	scopeRef?: string;
};

export type AddEntitlementsToRoleRequest = {
	entitlementInputs: EntitlementAssignmentInput[];
	etag: string;
};

export async function addEntitlementsToRole(
	roleId: string,
	data: AddEntitlementsToRoleRequest,
): Promise<void> {
	return post<void>(`authorize/roles/${roleId}/entitlement-assignment`, {
		json: data,
	});
}

// ============ RoleSuite APIs ============
export type AuthzRoleSuiteDto = {
	id: string;
	name: string;
	description?: string;
	ownerType: string;
	ownerRef: string;
	isRequestable: boolean;
	isRequiredAttachment: boolean;
	isRequiredComment: boolean;
	orgId?: string;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	etag?: string;
	rolesCount?: number;
	ownerName?: string;
	roles?: Array<{ id: string; name?: string; orgId?: string }>;
	[key: string]: unknown;
};

export async function listRoleSuites(
	params?: ListQuery,
): Promise<ListResponse<AuthzRoleSuiteDto>> {
	const options: Options = {};
	if (params) {
		(options as any).searchParams = params;
	}
	return get<ListResponse<AuthzRoleSuiteDto>>('authorize/role-suites', options);
}

export async function getRoleSuite(id: string): Promise<AuthzRoleSuiteDto> {
	return get<AuthzRoleSuiteDto>(`authorize/role-suites/${id}`);
}

export async function createRoleSuite(
	data: Omit<AuthzRoleSuiteDto, 'id' | 'createdAt' | 'updatedAt' | 'etag' | 'rolesCount' | 'ownerName'>,
): Promise<AuthzRoleSuiteDto> {
	return post<AuthzRoleSuiteDto>('authorize/role-suites', {
		json: data,
	});
}

export async function updateRoleSuite(
	id: string,
	etag: string,
	data: { name?: string; description?: string | null; roles?: string[] },
): Promise<AuthzRoleSuiteDto> {
	return put<AuthzRoleSuiteDto>(`authorize/role-suites/${id}`, {
		json: { ...data, etag },
	});
}

export async function deleteRoleSuite(id: string): Promise<void> {
	return del<void>(`authorize/role-suites/${id}`);
}
