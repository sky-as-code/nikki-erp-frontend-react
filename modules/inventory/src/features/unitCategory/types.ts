import type {
	CreateResponse,
	DeleteResponse,
	SearchResponse,
	UpdateResponse,
} from '@nikkierp/common';

export type UnitCategory = {
	id: string;
	name: Record<string, string>;
	orgId?: string;
	createdAt: string;
	updatedAt: string;
	etag: string;
};

export type CreateUnitCategoryRequest = {
	name: Record<string, string>;
	orgId?: string;
};

export type UpdateUnitCategoryRequest = {
	id: string;
	etag: string;
	name?: Record<string, string>;
	orgId?: string;
};

export type SearchUnitCategoriesResponse = SearchResponse<UnitCategory>;
export type CreateUnitCategoryResponse = CreateResponse;
export type UpdateUnitCategoryResponse = UpdateResponse;
export type DeleteUnitCategoryResponse = DeleteResponse;
