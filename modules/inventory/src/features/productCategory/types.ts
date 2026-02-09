import type {
	CreateResponse,
	DeleteResponse,
	SearchResponse,
	UpdateResponse,
} from '@nikkierp/common';


export type ProductCategoryLangText = string | Record<string, string>;

export type ProductCategory = {
	id: string;
	orgId: string;
	name: ProductCategoryLangText;
	createdAt: string;
	updatedAt: string;
	etag: string;
};

export type CreateProductCategoryRequest = {
	orgId: string;
	name: ProductCategoryLangText;
};

export type UpdateProductCategoryRequest = {
	id: string;
	etag: string;
	name?: ProductCategoryLangText;
};

export type SearchProductCategoriesResponse = SearchResponse<ProductCategory>;
export type CreateProductCategoryResponse = CreateResponse;
export type UpdateProductCategoryResponse = UpdateResponse;
export type DeleteProductCategoryResponse = DeleteResponse;
