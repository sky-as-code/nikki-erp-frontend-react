export type ApiResult<T> = {
	data?: T;
	errors?: string[];
};

export interface CreateResponse {
	id: string;
	etag: string;
	createdAt: Date;
};

export interface UpdateResponse {
	id: string;
	etag: string;
	updatedAt: Date;
};

export interface DeleteResponse {
	id: string;
	deletedAt: Date;
};

export interface SearchResponse<T> {
	items: T[];
	total: number;
	page: number;
	size: number;
};

export interface ListQuery {
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
	[key: string]: unknown;
}

export interface ListResponse<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export interface ManageMembersRequest {
	id: string;
	add?: string[];
	remove?: string[];
	etag: string;
};

export interface ManageMembersResponse {
	id: string;
	etag: string;
	updatedAt: Date;
};