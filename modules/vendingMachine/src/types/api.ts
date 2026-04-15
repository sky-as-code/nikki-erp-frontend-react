import { SearchGraph } from './search-graph';


export type RestCreateResponse = {
	id: string;
	createdAt: number;
	etag: string;
};

export type RestUpdateResponse = {
	affectedCount: number;
	affectedAt: string;
	etag: string;
};

export type RestArchiveResponse = {
	affectedCount: number;
	affectedAt: string;
	etag: string;
};

export type RestDeleteResponse = {
	affectedCount: number;
	affectedAt: string;
	etag: string;
};

export type Pagination = {
	total: number;
	page: number;
	size: number;
};

export type PagedSearchResponse<T> = Pagination & {
	items: T[];
};

export type SearchParams<T=any> = {
	page?: number;
	size?: number;
	graph?: SearchGraph;
	columns?: Array<keyof T>;
};