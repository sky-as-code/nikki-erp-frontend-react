import { get, type Options } from '@nikkierp/common';


export type AuthzResourceDto = {
	id: string;
	name: string;
	description?: string;
	resourceType?: string;
	resourceRef?: string;
	scopeType?: string;
	etag?: string;
	actions?: AuthzActionDto[];
	[key: string]: unknown;
};

export type AuthzActionDto = {
	id: string;
	name: string;
	description?: string;
	etag?: string;
	resourceId: string;
	resourceName?: string;
	[key: string]: unknown;
};

export type AuthzEntitlementDto = {
	id: string;
	name: string;
	description?: string;
	etag?: string;
	actionId: string;
	resourceId: string;
	subjectType?: string;
	subjectRef?: string;
	orgId?: string | null;
	scopeRef?: string | null;
	actionName?: string;
	resourceName?: string;
	subjectDisplayName?: string | null;
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

export async function listResources(
	params?: ListQuery,
): Promise<ListResponse<AuthzResourceDto>> {
	const options: Options = {};
	if (params) {
		(options as any).searchParams = {
			...params,
			withActions: true,
		};
	}
	return get<ListResponse<AuthzResourceDto>>('authorize/resources', options);
}

export async function listEntitlements(
	params?: ListQuery,
): Promise<ListResponse<AuthzEntitlementDto>> {
	const options: Options = {};
	if (params) {
		(options as any).searchParams = params;
	}
	return get<ListResponse<AuthzEntitlementDto>>('authorize/entitlements', options);
}
