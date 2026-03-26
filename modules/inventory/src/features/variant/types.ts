import type {
	CreateResponse,
	DeleteResponse,
	SearchResponse,
	UpdateResponse,
} from '@nikkierp/common';

export type VariantAttribute = {
	codeName: string;
	value: string | number;
};

export type Variant = {
	id: string;
	productId: string;
	name: Record<string, string>;
	sku: string;
	barcode?: string;
	proposedPrice: number;
	imageURL?: string;
	status: string;
	attributes?: VariantAttribute[];
	product?: {
		id: string;
		name: Record<string, string>;
	};
	createdAt: string;
	updatedAt: string;
	etag: string;
};

export type CreateVariantRequest = {
	productId: string;
	name: Record<string, string>;
	sku?: string;
	barcode?: string;
	proposedPrice?: number;
	imageURL?: string;
	status?: string;
	attributes?: Record<string, unknown>;
};

export type UpdateVariantRequest = {
	id: string;
	etag: string;
	sku?: string;
	barcode?: string;
	proposedPrice?: number;
	imageURL?: string;
	status?: string;
	attributes?: Record<string, unknown>;
};

export type SearchVariantsResponse = SearchResponse<Variant>;
export type CreateVariantResponse = CreateResponse;
export type UpdateVariantResponse = UpdateResponse;
export type DeleteVariantResponse = DeleteResponse;
