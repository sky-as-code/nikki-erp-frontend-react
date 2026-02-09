import type {
	CreateResponse,
	DeleteResponse,
	SearchResponse,
	UpdateResponse,
} from '@nikkierp/common';


export type ProductStatus = 'active' | 'inactive';
export type ProductLangText = string | Record<string, string>;


export type Product = {
	id: string;
	orgId: string;
	name: ProductLangText;
	description?: ProductLangText;
	sku?: string;
	barCode?: string;
	unitId?: string;
	status: ProductStatus;
	thumbnailUrl?: string;
	proposedPrice?: number;
	defaultVariantId?: string;
	attributeIds?: string[];
	productCategoryIds?: string[];
	createdAt: string;
	updatedAt: string;
	etag: string;
};

export type CreateProductRequest = {
	orgId: string;
	name: ProductLangText;
	description?: ProductLangText;
	sku?: string;
	barCode?: string;
	unitId?: string;
	status?: ProductStatus;
	thumbnailUrl?: string;
	proposedPrice?: number;
};

export type UpdateProductRequest = {
	id: string;
	etag: string;
	name?: ProductLangText;
	description?: ProductLangText;
	unitId?: string;
	status?: ProductStatus;
	thumbnailUrl?: string;
	defaultVariantId?: string;
};

export type SearchProductsResponse = SearchResponse<Product>;
export type CreateProductResponse = CreateResponse;
export type UpdateProductResponse = UpdateResponse;
export type DeleteProductResponse = DeleteResponse;
