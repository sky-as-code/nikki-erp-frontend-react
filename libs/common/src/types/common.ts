export type ApiResult<T> = {
	data?: T;
	errors?: string[];
};

/**
 * @deprecated Use RestCreateResponse instead
 */
export interface CreateResponse {
	id: string;
	etag: string;
	createdAt: Date;
};

/**
 * @deprecated Use RestMutateResponse instead
 */
export interface UpdateResponse {
	id: string;
	etag: string;
	updatedAt: Date;
};

/**
 * @deprecated Use RestDeleteResponse instead
 */
export interface DeleteResponse {
	id: string;
	deletedAt: Date;
};

/**
 * @deprecated Use RestSearchResponse instead
 */
export interface SearchResponse<T> {
	items: T[];
	total: number;
	page: number;
	size: number;
};

/**
 * @deprecated Use RestSearchRequest instead
 */
export interface ListQuery {
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
	[key: string]: unknown;
}

/**
 * @deprecated Use RestSearchResponse instead
 */
export interface ListResponse<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

/**
 * @deprecated
 */
export interface ManageMembersRequest {
	id: string;
	add?: string[];
	remove?: string[];
	etag: string;
};

/**
 * @deprecated Use RestManageM2mResponse instead
 */
export interface ManageMembersResponse {
	id: string;
	etag: string;
	updatedAt: Date;
};