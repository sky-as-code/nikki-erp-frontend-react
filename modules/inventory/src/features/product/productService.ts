import {
	mockProductsData,
	mockVariantsData,
	nextEtag,
	nowIso,
	waitMock,
} from '../../mockData';
import { toLocalizedText } from '../localizedText';

import type {
	DeleteProductResponse,
	Product,
	ProductStatus,
	SearchProductsResponse,
	CreateProductRequest,
	CreateProductResponse,
	UpdateProductRequest,
	UpdateProductResponse,
} from './types';


const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const normalizeProductText = (value: Product['name'] | Product['description']) => {
	if (typeof value === 'string') {
		return toLocalizedText(value);
	}

	return value;
};


export const productService = {
	async listProducts(orgId: string, categoryId?: string): Promise<SearchProductsResponse> {
		await waitMock();
		let items = mockProductsData
			.filter((product) => product.orgId === orgId);

		if (categoryId) {
			items = items.filter((product) => {
				return (product.productCategoryIds ?? []).includes(categoryId);
			});
		}

		return {
			items: clone(items),
			total: items.length,
			page: 1,
			size: items.length,
		};
	},

	async getProduct(id: string): Promise<Product> {
		await waitMock();
		const product = mockProductsData.find((item) => item.id === id);
		if (!product) {
			throw new Error('Product not found');
		}
		return clone(product);
	},

	async createProduct(data: CreateProductRequest): Promise<CreateProductResponse> {
		await waitMock();
		const createdAt = nowIso();
		const id = `prod-${Date.now()}`;
		const normalizedName = normalizeProductText(data.name);
		if (!normalizedName) {
			throw new Error('Product name is required');
		}
		const product: Product = {
			id,
			orgId: data.orgId,
			name: normalizedName,
			sku: data.sku,
			barCode: data.barCode,
			description: normalizeProductText(data.description),
			unitId: data.unitId,
			productCategoryIds: [],
			status: data.status ?? 'active',
			attributeIds: [],
			thumbnailUrl: data.thumbnailUrl,
			proposedPrice: data.proposedPrice,
			createdAt,
			updatedAt: createdAt,
			etag: nextEtag(),
		};
		mockProductsData.unshift(product);
		return {
			id,
			etag: product.etag,
			createdAt: new Date(createdAt),
		};
	},

	async updateProduct(data: UpdateProductRequest): Promise<UpdateProductResponse> {
		await waitMock();
		const index = mockProductsData.findIndex((product) => product.id === data.id);
		if (index < 0) {
			throw new Error('Product not found');
		}
		const existing = mockProductsData[index];
		const updatedAt = nowIso();
		const updated: Product = {
			...existing,
			...data,
			name: data.name === undefined
				? existing.name
				: (normalizeProductText(data.name) ?? existing.name),
			description: data.description === undefined
				? existing.description
				: normalizeProductText(data.description),
			updatedAt,
			etag: nextEtag(),
		};
		mockProductsData[index] = updated;
		return {
			id: updated.id,
			etag: updated.etag,
			updatedAt: new Date(updatedAt),
		};
	},

	async deleteProduct(id: string): Promise<DeleteProductResponse> {
		await waitMock();
		const index = mockProductsData.findIndex((product) => product.id === id);
		if (index >= 0) {
			mockProductsData.splice(index, 1);
			for (let i = mockVariantsData.length - 1; i >= 0; i -= 1) {
				if (mockVariantsData[i].productId === id) {
					mockVariantsData.splice(i, 1);
				}
			}
		}
		return {
			id,
			deletedAt: new Date(),
		};
	},

	async bulkDeleteProducts(ids: string[]): Promise<{ deletedIds: string[] }> {
		await waitMock();
		const deletedIds = Array.from(new Set(ids));
		for (const id of deletedIds) {
			await this.deleteProduct(id);
		}
		return { deletedIds };
	},

	async bulkUpdateStatus(ids: string[], status: ProductStatus): Promise<{ updatedIds: string[] }> {
		await waitMock();
		const updatedIds: string[] = [];
		ids.forEach((id) => {
			const product = mockProductsData.find((item) => item.id === id);
			if (!product) {
				return;
			}
			product.status = status;
			product.updatedAt = nowIso();
			product.etag = nextEtag();
			updatedIds.push(id);
		});
		return { updatedIds };
	},
};
