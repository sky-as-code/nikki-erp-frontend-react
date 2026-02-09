import {
	mockProductCategoriesData,
} from '../../mockData/mockProductCategories';
import {
	nextEtag,
	nextId,
	nowIso,
	waitMock,
} from '../../mockData/utils';
import type {
	CreateProductCategoryRequest,
	CreateProductCategoryResponse,
	DeleteProductCategoryResponse,
	ProductCategory,
	SearchProductCategoriesResponse,
	UpdateProductCategoryRequest,
	UpdateProductCategoryResponse,
} from './types';


const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const productCategoryService = {
	async listProductCategories(orgId: string): Promise<SearchProductCategoriesResponse> {
		await waitMock();
		const items = mockProductCategoriesData
			.filter((category) => category.orgId === orgId);
		return {
			items: clone(items),
			total: items.length,
			page: 1,
			size: items.length,
		};
	},

	async getProductCategory(id: string): Promise<ProductCategory> {
		await waitMock();
		const category = mockProductCategoriesData.find((item) => item.id === id);
		if (!category) {
			throw new Error('Category not found');
		}
		return clone(category);
	},

	async createProductCategory(data: CreateProductCategoryRequest): Promise<CreateProductCategoryResponse> {
		await waitMock();
		const createdAt = nowIso();
		const id = nextId('cat', mockProductCategoriesData);
		const category: ProductCategory = {
			id,
			orgId: data.orgId,
			name: data.name,
			createdAt,
			updatedAt: createdAt,
			etag: nextEtag(),
		};

		mockProductCategoriesData.push(category);

		return {
			id,
			etag: category.etag,
			createdAt: new Date(createdAt),
		};
	},

	async updateProductCategory(data: UpdateProductCategoryRequest): Promise<UpdateProductCategoryResponse> {
		await waitMock();

		const index = mockProductCategoriesData.findIndex((item) => item.id === data.id);
		if (index < 0) {
			throw new Error('Category not found');
		}

		const current = mockProductCategoriesData[index];

		const updatedAt = nowIso();
		const updated: ProductCategory = {
			...current,
			...data,
			updatedAt,
			etag: nextEtag(),
		};

		mockProductCategoriesData[index] = updated;

		return {
			id: updated.id,
			etag: updated.etag,
			updatedAt: new Date(updatedAt),
		};
	},

	async deleteProductCategory(id: string): Promise<DeleteProductCategoryResponse> {
		await waitMock();

		const index = mockProductCategoriesData.findIndex((item) => item.id === id);
		if (index >= 0) {
			mockProductCategoriesData.splice(index, 1);
		}

		return {
			id,
			deletedAt: new Date(),
		};
	},
};
