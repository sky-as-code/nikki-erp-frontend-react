import { del, get, post, put, type Options } from '@nikkierp/common';

import { Resource } from '@/features/resources';

import type { Org } from '@/features/identities';


// export type AuthzResourceDto = {
// 	id: string;
// 	name: string;
// 	description?: string;
// 	resourceType: string;
// 	resourceRef?: string;
// 	scopeType: string;
// 	createdAt: string;
// 	etag: string;
// 	actions?: AuthzActionDto[];
// 	actionsCount?: number;
// 	[key: string]: unknown;
// };

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
): Promise<ListResponse<Resource>> {
	const options: Options = {};
	if (params) {
		(options as any).searchParams = params;
	}
	return get<ListResponse<Resource>>('authorize/resources', options);
}

export async function getResource(name: string): Promise<Resource> {
	return get<Resource>(`authorize/resources/${name}`);
}

export async function createResource(
	data: Resource,
): Promise<Resource> {
	return post<Resource>('authorize/resources', {
		json: data,
	});
}

export async function updateResource(
	id: string,
	etag: string,
	description?: string | null,
): Promise<Resource> {
	return put<Resource>(`authorize/resources/${id}`, {
		json: { description, etag },
	});
}

export async function deleteResource(name: string): Promise<void> {
	const options: Options = {};
	return del<void>(`authorize/resources/${name}`, options);
}

// ============ Action APIs ============
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
	scopeRef?: string;
	[key: string]: unknown;
};

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

export async function getEntitlementsByIds(ids: string[]): Promise<AuthzEntitlementDto[]> {
	return post<AuthzEntitlementDto[]>(`authorize/entitlements/ids`, {
		json: { ids: ids },
	});
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
	org?: Org;
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

export type RemoveEntitlementsFromRoleRequest = {
	entitlementInputs: EntitlementAssignmentInput[];
	etag: string;
};

export async function removeEntitlementsFromRole(
	roleId: string,
	data: RemoveEntitlementsFromRoleRequest,
): Promise<void> {
	return del<void>(`authorize/roles/${roleId}/entitlement-assignment`, {
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
	// orgId?: string;
	org?: Org;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	etag?: string;
	rolesCount?: number;
	ownerName?: string;
	roles?: Array<{ id: string; name?: string; orgId?: string }>;
	roleIds?: string[];
	[key: string]: unknown;
};

export async function listRoleSuites(
	params?: ListQuery,
): Promise<ListResponse<AuthzRoleSuiteDto>> {
	const options: Options = {};
	if (params) {
		const { graph, ...rest } = params;
		(options as any).searchParams = {
			...rest,
			graph: graph ? JSON.stringify(graph) : undefined,
		};
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
	data: Partial<AuthzRoleSuiteDto>,
): Promise<AuthzRoleSuiteDto> {
	return put<AuthzRoleSuiteDto>(`authorize/role-suites/${id}`, {
		json: { ...data, etag } as Partial<AuthzRoleSuiteDto>,
	});
}

export async function deleteRoleSuite(id: string): Promise<void> {
	return del<void>(`authorize/role-suites/${id}`);
}

// ============ GrantRequest APIs ============
export type AuthzGrantRequestDto = {
	id: string;
	attachmentUrl?: string;
	comment?: string;
	targetType: string;
	targetRef: string;
	responseId?: string | null;
	status: string;
	orgId?: string | null;
	org?: Org | null;
	createdAt: string;
	approver?: { id: string; name: string } | null;
	requestor?: { id: string; name: string };
	requestorId?: string;
	receiver?: { id: string; name: string };
	receiverId?: string;
	receiverType?: string;
	target?: {id: string; name: string};
	targetId?: string;
	etag?: string;
};

export async function listGrantRequests(params?: ListQuery): Promise<ListResponse<AuthzGrantRequestDto>> {
	const options: Options = {};
	if (params) (options as any).searchParams = params;
	return get<ListResponse<AuthzGrantRequestDto>>('authorize/grant-requests', options);
}

export async function getGrantRequest(id: string): Promise<AuthzGrantRequestDto> {
	return get<AuthzGrantRequestDto>(`authorize/grant-requests/${id}`);
}

export async function createGrantRequest(
	data: Partial<AuthzGrantRequestDto>,
): Promise<AuthzGrantRequestDto> {
	return post<AuthzGrantRequestDto>('authorize/grant-requests', { json: data });
}

export async function respondGrantRequest(
	id: string,
	decision: 'approve' | 'deny',
	etag: string,
	responderId: string,
): Promise<AuthzGrantRequestDto> {
	return post<AuthzGrantRequestDto>(`authorize/grant-requests/${id}/respond`, {
		json: { decision, etag, responderId },
	});
}

export async function cancelGrantRequest(id: string): Promise<void> {
	await del<void>(`authorize/grant-requests/cancel/${id}`);
}

export async function deleteGrantRequest(id: string): Promise<void> {
	await del<void>(`authorize/grant-requests/${id}`);
}

// ============ RevokeRequest APIs ============
export type AuthzRevokeRequestDto = {
	id: string;
	etag?: string;
	requestorId?: string;
	requestor?: { id: string; name: string };
	receiverType: string;
	receiverId: string;
	receiver?: { id: string; name: string };
	targetType: string;
	targetRef?: string;
	target?: { id: string; name: string };
	targetId?: string;
	attachmentUrl?: string;
	comment?: string;
	createdAt: string;
};

export type AuthzBulkRevokeRequestInputDto = {
	attachmentUrl?: string;
	comment?: string;
	requestorId: string;
	receiverType: string;
	receiverId: string;
	targetType: string;
	targetRef: string;
};

export type AuthzBulkRevokeRequestRequestDto = {
	items: AuthzBulkRevokeRequestInputDto[];
};

export type AuthzBulkRevokeRequestItemDto = {
	id: string;
	createdAt: number;
	etag: string;
};

export type AuthzBulkRevokeRequestResponseDto = {
	items: AuthzBulkRevokeRequestItemDto[];
};

export async function listRevokeRequests(params?: ListQuery): Promise<ListResponse<AuthzRevokeRequestDto>> {
	const options: Options = {};
	if (params) {
		const { graph, ...rest } = params;
		(options as any).searchParams = {
			...rest,
			graph: graph ? JSON.stringify(graph) : undefined,
		};
	}
	return get<ListResponse<AuthzRevokeRequestDto>>('authorize/revoke-requests', options);
}

export async function getRevokeRequest(id: string): Promise<AuthzRevokeRequestDto> {
	return get<AuthzRevokeRequestDto>(`authorize/revoke-requests/${id}`);
}

export async function createRevokeRequest(
	data: Partial<AuthzRevokeRequestDto>,
): Promise<AuthzRevokeRequestDto> {
	return post<AuthzRevokeRequestDto>('authorize/revoke-requests', { json: data });
}

export async function bulkCreateRevokeRequests(
	data: AuthzBulkRevokeRequestRequestDto,
): Promise<AuthzBulkRevokeRequestResponseDto> {
	return post<AuthzBulkRevokeRequestResponseDto>('authorize/revoke-requests/bulk', { json: data });
}

export async function deleteRevokeRequest(id: string): Promise<void> {
	return del<void>(`authorize/revoke-requests/${id}`);
}
