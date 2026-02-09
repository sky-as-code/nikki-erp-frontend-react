import type {
	CreateResponse,
	DeleteResponse,
	SearchResponse,
	UpdateResponse,
} from '@nikkierp/common';


export type UnitCategory = {
	id: string;
	name: string;
	orgId?: string;
	status?: string;
	thumbnailURL?: string;
	createdAt: string;
	updatedAt: string;
	etag: string;

	// Compatibility fields for existing UI views.
	parentId?: string | null;
	description?: string;
	unitIds?: string[];
	unitCount?: number;
};

export type CreateUnitCategoryRequest = {
	name: string;
	orgId?: string;
	status?: string;
	thumbnailURL?: string;

	// Compatibility fields for existing create forms.
	parentId?: string | null;
	description?: string;
};

export type UpdateUnitCategoryRequest = {
	id: string;
	etag: string;
	name?: string;
	orgId?: string;
	status?: string;
	thumbnailURL?: string;

	// Compatibility fields for existing update forms.
	parentId?: string | null;
	description?: string;
};

export type SearchUnitCategoriesResponse = SearchResponse<UnitCategory>;
export type CreateUnitCategoryResponse = CreateResponse;
export type UpdateUnitCategoryResponse = UpdateResponse;
export type DeleteUnitCategoryResponse = DeleteResponse;
