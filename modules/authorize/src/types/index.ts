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
