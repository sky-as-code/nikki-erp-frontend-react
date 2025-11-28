import { del, get, post, put, type Options } from '@nikkierp/common';


export type AuthzResourceDto = {
	id: string;
	name: string;
	description?: string;
	resourceType?: string;
	resourceRef?: string;
	scopeType?: string;
	scopeRef?: string;
	createdAt?: string;
	etag?: string;
	actions?: AuthzActionDto[];
	actionsCount?: number;
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
	params?: ListQuery & { withActions?: boolean },
): Promise<ListResponse<AuthzResourceDto>> {
	const options: Options = {};
	if (params) {
		(options as any).searchParams = params;
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

export async function getResource(name: string): Promise<AuthzResourceDto> {
	return get<AuthzResourceDto>(`authorize/resources/${name}`);
}

export async function createResource(
	data: Omit<AuthzResourceDto, 'id' | 'createdAt' | 'etag'>,
): Promise<AuthzResourceDto> {
	return post<AuthzResourceDto>('authorize/resources', {
		json: data,
	});
}

export async function updateResource(
	id: string,
	data: Partial<Omit<AuthzResourceDto, 'id' | 'createdAt' | 'updatedAt'>>,
	etag?: string,
): Promise<AuthzResourceDto> {
	const options: Options = {
		json: data,
	};
	if (etag) {
		options.headers = {
			'If-Match': etag,
		};
	}
	return put<AuthzResourceDto>(`authorize/resources/${id}`, options);
}

export async function deleteResource(name: string): Promise<void> {
	const options: Options = {};
	return del<void>(`authorize/resources/${name}`, options);
}
