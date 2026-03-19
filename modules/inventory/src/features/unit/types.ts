import type {
	CreateResponse,
	DeleteResponse,
	SearchResponse,
	UpdateResponse,
} from '@nikkierp/common';

export type Unit = {
	id: string;
	orgId: string;
	name: Record<string, string>;
	symbol?: string;
	categoryId?: string;
	baseUnit?: string;
	multiplier?: number;
	status?: string;
	createdAt: number;
	updatedAt?: number;
	etag: string;
};

export type CreateUnitRequest = {
	orgId: string;
	name: Record<string, string>;
	symbol?: string;
	categoryId?: string;
	baseUnit?: string;
	multiplier?: number;
	status?: string;
};

export type UpdateUnitRequest = {
	id: string;
	etag: string;
	name?: Record<string, string>;
	symbol?: string;
	categoryId?: string;
	baseUnit?: string;
	multiplier?: number;
	status?: string;
};

export type SearchUnitsResponse = SearchResponse<Unit>;
export type CreateUnitResponse = CreateResponse;
export type UpdateUnitResponse = UpdateResponse;
export type DeleteUnitResponse = DeleteResponse;
