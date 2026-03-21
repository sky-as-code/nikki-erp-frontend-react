import * as request from '@nikkierp/common/request';

import type {
	CreateProductCategoryRequest,
	CreateProductCategoryResponse,
	DeleteProductCategoryResponse,
	ProductCategory,
	SearchProductCategoriesResponse,
	UpdateProductCategoryRequest,
	UpdateProductCategoryResponse,
} from './types';

export const productCategoryService = {
	async listProductCategories(orgId: string): Promise<SearchProductCategoriesResponse> {
		const response = await request.get<SearchProductCategoriesResponse>(
			`${orgId}/inventory/products-category`
		);
		return response;
	},

	async getProductCategory(orgId: string, id: string): Promise<ProductCategory> {
		const response = await request.get<ProductCategory>(`${orgId}/inventory/products-category/${id}`);
		return response;
	},

	async createProductCategory(orgId: string, data: CreateProductCategoryRequest): Promise<CreateProductCategoryResponse> {
		const response = await request.post<CreateProductCategoryResponse>(
			`${orgId}/inventory/products-category`,
			{ json: data }
		);
		return response;
	},

	async updateProductCategory(orgId: string, data: UpdateProductCategoryRequest): Promise<UpdateProductCategoryResponse> {
		const response = await request.put<UpdateProductCategoryResponse>(
			`${orgId}/inventory/products-category/${data.id}`,
			{ json: data }
		);
		return response;
	},

	async deleteProductCategory(orgId: string, id: string): Promise<DeleteProductCategoryResponse> {
		const response = await request.del<DeleteProductCategoryResponse>(
			`${orgId}/inventory/products-category/${id}`
		);
		return response;
	},
};
