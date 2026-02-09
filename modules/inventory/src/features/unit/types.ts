import type {
	CreateResponse,
	DeleteResponse,
	SearchResponse,
	UpdateResponse,
} from '@nikkierp/common';


export type Unit = {
	id: string;
	name: string;
	symbol: string;
	categoryId: string;
	orgId?: string;
	baseUnit?: string;
	multiplier?: number;
	status?: string;
	createdAt: string;
	updatedAt: string;
	etag: string;

	// Legacy fields for compatibility with existing UI code paths.
	code?: string;
	category?: string;
	conversionRatio?: number;
	baseUnitId?: string;
};

export type CreateUnitRequest = {
	name: string;
	symbol: string;
	categoryId?: string;
	orgId?: string;
	baseUnit?: string;
	multiplier?: number;
	status?: string;

	// Legacy fields for compatibility with existing create forms.
	code?: string;
	category?: string;
	conversionRatio?: number;
	baseUnitId?: string;
};

export type UpdateUnitRequest = {
	id: string;
	etag: string;
	name?: string;
	symbol?: string;
	categoryId?: string;
	orgId?: string;
	baseUnit?: string;
	multiplier?: number;
	status?: string;

	// Legacy fields for compatibility with existing update forms.
	code?: string;
	category?: string;
	conversionRatio?: number;
	baseUnitId?: string;
};

export type SearchUnitsResponse = SearchResponse<Unit>;
export type CreateUnitResponse = CreateResponse;
export type UpdateUnitResponse = UpdateResponse;
export type DeleteUnitResponse = DeleteResponse;
