import { get, type Options } from '@nikkierp/common/request';


export type IdentityUserDto = {
	id: string;
	displayName: string;
	email: string;
	avatarUrl?: string;
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

export async function listUsers(
	params?: ListQuery,
): Promise<ListResponse<IdentityUserDto>> {
	const options: Options = {};
	if (params) {
		const { graph, ...rest } = params;
		(options as any).searchParams = {
			...rest,
			graph: graph ? JSON.stringify(graph) : undefined,
		};
	}
	return get<ListResponse<IdentityUserDto>>('identity/users', options);
}

