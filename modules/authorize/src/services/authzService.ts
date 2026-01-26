import { del, get, post, put, type Options } from '@nikkierp/common';

import type {
	Action,
	Resource,
	Role,
	RoleSuite,
	Entitlement,
	GrantRequest,
	RevokeRequest,
} from '@/features';


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
export async function listActions(
	params?: ListQuery,
): Promise<ListResponse<Action>> {
	const options: Options = {};
	if (params) {
		(options as any).searchParams = params;
	}
	return get<ListResponse<Action>>('authorize/actions', options);
}

export async function getAction(
	actionId: string,
): Promise<Action> {
	return get<Action>(`authorize/actions/${actionId}`);
}

export async function createAction(
	data: Action,
): Promise<Action> {
	return post<Action>(`authorize/actions`, {
		json: data,
	});
}

export async function updateAction(
	actionId: string,
	etag: string,
	data: Action,
): Promise<Action> {
	return put<Action>(`authorize/actions/${actionId}`, {
		json: { ...data, etag },
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
): Promise<ListResponse<Entitlement>> {
	const options: Options = {};
	if (params) {
		(options as any).searchParams = params;
	}
	return get<ListResponse<Entitlement>>('authorize/entitlements', options);
}

export async function getEntitlement(id: string): Promise<Entitlement> {
	return get<Entitlement>(`authorize/entitlements/${id}`);
}

export async function getEntitlementsByIds(ids: string[]): Promise<Entitlement[]> {
	return post<Entitlement[]>(`authorize/entitlements/ids`, {
		json: { ids: ids },
	});
}

export async function createEntitlement(
	data: Entitlement,
): Promise<Entitlement> {
	return post<Entitlement>('authorize/entitlements', {
		json: data,
	});
}

export async function updateEntitlement(
	id: string,
	etag: string,
	data: Entitlement,
): Promise<Entitlement> {
	return put<Entitlement>(`authorize/entitlements/${id}`, {
		json: { ...data, etag },
	});
}

export async function deleteEntitlement(id: string): Promise<void> {
	return del<void>(`authorize/entitlements/${id}`);
}

// ============ Role APIs ============
export async function listRoles(
	params?: ListQuery,
): Promise<ListResponse<Role>> {
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

	return get<ListResponse<Role>>('authorize/roles', options);
}


export async function getRole(id: string): Promise<Role> {
	return get<Role>(`authorize/roles/${id}`);
}

export async function createRole(
	data: Omit<Role, 'id' | 'createdAt' | 'etag' | 'entitlementsCount' | 'entitlements'>,
): Promise<Role> {
	return post<Role>('authorize/roles', {
		json: data,
	});
}

export async function updateRole(
	id: string,
	etag: string,
	data: Role,
): Promise<Role> {
	return put<Role>(`authorize/roles/${id}`, {
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
export async function listRoleSuites(
	params?: ListQuery,
): Promise<ListResponse<RoleSuite>> {
	const options: Options = {};
	if (params) {
		const { graph, ...rest } = params;
		(options as any).searchParams = {
			...rest,
			graph: graph ? JSON.stringify(graph) : undefined,
		};
	}
	return get<ListResponse<RoleSuite>>('authorize/role-suites', options);
}

export async function getRoleSuite(id: string): Promise<RoleSuite> {
	return get<RoleSuite>(`authorize/role-suites/${id}`);
}

export async function createRoleSuite(
	data: RoleSuite,
): Promise<RoleSuite> {
	return post<RoleSuite>('authorize/role-suites', {
		json: data,
	});
}

export async function updateRoleSuite(
	id: string,
	etag: string,
	data: Partial<RoleSuite>,
): Promise<RoleSuite> {
	return put<RoleSuite>(`authorize/role-suites/${id}`, {
		json: { ...data, etag } as Partial<RoleSuite>,
	});
}

export async function deleteRoleSuite(id: string): Promise<void> {
	return del<void>(`authorize/role-suites/${id}`);
}

// ============ GrantRequest APIs ============
export async function listGrantRequests(params?: ListQuery): Promise<ListResponse<GrantRequest>> {
	const options: Options = {};
	if (params) (options as any).searchParams = params;
	return get<ListResponse<GrantRequest>>('authorize/grant-requests', options);
}

export async function getGrantRequest(id: string): Promise<GrantRequest> {
	return get<GrantRequest>(`authorize/grant-requests/${id}`);
}

export async function createGrantRequest(
	data: GrantRequest,
): Promise<GrantRequest> {
	return post<GrantRequest>('authorize/grant-requests', { json: data });
}

export async function respondGrantRequest(
	id: string,
	decision: 'approve' | 'deny',
	etag: string,
	responderId: string,
): Promise<GrantRequest> {
	return post<GrantRequest>(`authorize/grant-requests/${id}/respond`, {
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

export async function listRevokeRequests(params?: ListQuery): Promise<ListResponse<RevokeRequest>> {
	const options: Options = {};
	if (params) {
		const { graph, ...rest } = params;
		(options as any).searchParams = {
			...rest,
			graph: graph ? JSON.stringify(graph) : undefined,
		};
	}
	return get<ListResponse<RevokeRequest>>('authorize/revoke-requests', options);
}

export async function getRevokeRequest(id: string): Promise<RevokeRequest> {
	return get<RevokeRequest>(`authorize/revoke-requests/${id}`);
}

export async function createRevokeRequest(
	data: RevokeRequest,
): Promise<RevokeRequest> {
	return post<RevokeRequest>('authorize/revoke-requests', { json: data });
}

export async function bulkCreateRevokeRequests(
	data: AuthzBulkRevokeRequestRequestDto,
): Promise<AuthzBulkRevokeRequestResponseDto> {
	return post<AuthzBulkRevokeRequestResponseDto>('authorize/revoke-requests/bulk', { json: data });
}

export async function deleteRevokeRequest(id: string): Promise<void> {
	return del<void>(`authorize/revoke-requests/${id}`);
}
