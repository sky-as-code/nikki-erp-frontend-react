import type {
	CreateResponse,
	DeleteResponse,
	SearchResponse,
	UpdateResponse,
} from '@nikkierp/common'

export type Product = {
	id: string;
	orgId: string;
	name: Record<string, string>;
	description?: Record<string, string>;
	sku?: string;
	barCode?: string;
	unitId?: string;
	status?: string;
	thumbnailURL?: string;
	proposedPrice?: number;
	defaultVariantId?: string;
	attributeIds?: string[];
	productCategoryIds?: string[];
	createdAt: number;
	updatedAt: number;
	etag: string;
};

export type CreateProductRequest = {
	orgId: string;
	name: Record<string, string>;
	description?: Record<string, string>;
	sku?: string;
	barCode?: string;
	unitId?: string;
	status?: string;
	thumbnailURL?: string;
	proposedPrice?: number;
};

export type UpdateProductRequest = {
	id: string;
	etag: string;
	name?: Record<string, string>;
	description?: Record<string, string>;
	unitId?: string;
	status?: string;
	thumbnailURL?: string;
	defaultVariantId?: string;
};

export type SearchProductsResponse = SearchResponse<Product>;
export type CreateProductResponse = CreateResponse;
export type UpdateProductResponse = UpdateResponse;
export type DeleteProductResponse = DeleteResponse;
