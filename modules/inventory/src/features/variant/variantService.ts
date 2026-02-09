import {
	mockProductsData,
	mockVariantsData,
	nextEtag,
	nowIso,
	waitMock,
} from '../../mockData';
import { localizedTextToString } from '../localizedText';

import type {
	CreateVariantRequest,
	CreateVariantResponse,
	DeleteVariantResponse,
	SearchVariantsResponse,
	UpdateVariantRequest,
	UpdateVariantResponse,
	Variant,
} from './types';



const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const normalizeVariantName = (data: CreateVariantRequest): Variant['name'] => {
	if (typeof data.name === 'string') {
		const normalized = data.name.trim();
		if (normalized) {
			return { en: normalized };
		}
	}

	if (data.name && typeof data.name === 'object') {
		const text = localizedTextToString(data.name);
		if (text) {
			return data.name;
		}
	}

	const fallback = data.sku?.trim() || 'New Variant';
	return { en: fallback };
};

const createVariantRecord = (data: CreateVariantRequest): Variant => {
	const createdAt = nowIso();
	return {
		id: `var-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
		productId: data.productId,
		name: normalizeVariantName(data),
		sku: data.sku ?? '',
		barcode: data.barcode,
		attributeValues: [],
		proposedPrice: data.proposedPrice ?? 0,
		imageUrl: data.imageUrl,
		status: data.status ?? 'active',
		attributes: data.attributes,
		createdAt,
		updatedAt: createdAt,
		etag: nextEtag(),
	};
};

export const variantService = {
	async listVariants(productId: string): Promise<SearchVariantsResponse> {
		await waitMock();
		const items = mockVariantsData
			.filter((variant) => variant.productId === productId);
		return {
			items: clone(items),
			total: items.length,
			page: 1,
			size: items.length,
		};
	},

	async listAllVariants(): Promise<SearchVariantsResponse> {
		await waitMock();
		const items = mockVariantsData;
		return {
			items: clone(items),
			total: items.length,
			page: 1,
			size: items.length,
		};
	},

	async getVariant(id: string, productId?: string): Promise<Variant> {
		await waitMock();
		const variant = mockVariantsData.find((item) => item.id === id && (!productId || item.productId === productId));
		if (!variant) {
			throw new Error('Variant not found');
		}
		return clone(variant);
	},

	async createVariant(data: CreateVariantRequest): Promise<CreateVariantResponse> {
		await waitMock();
		const variant = createVariantRecord(data);
		mockVariantsData.unshift(variant);
		return {
			id: variant.id,
			etag: variant.etag,
			createdAt: new Date(variant.createdAt),
		};
	},

	async createManyVariants(productId: string, data: Omit<CreateVariantRequest, 'productId'>[]): Promise<{ ids: string[] }> {
		await waitMock();
		const ids: string[] = [];
		for (const item of data) {
			const variant = createVariantRecord({ ...item, productId });
			mockVariantsData.push(variant);
			ids.push(variant.id);
		}
		return { ids };
	},

	async updateVariant(productId: string, data: UpdateVariantRequest): Promise<UpdateVariantResponse> {
		await waitMock();
		const index = mockVariantsData.findIndex(
			(variant) => variant.id === data.id && variant.productId === productId,
		);
		if (index < 0) {
			throw new Error('Variant not found');
		}
		const existing = mockVariantsData[index];
		const updatedAt = nowIso();
		const updated: Variant = {
			...existing,
			...data,
			proposedPrice: data.proposedPrice ?? existing.proposedPrice,
			updatedAt,
			etag: nextEtag(),
		};
		mockVariantsData[index] = updated;
		return {
			id: updated.id,
			etag: updated.etag,
			updatedAt: new Date(updatedAt),
		};
	},

	async deleteVariant(productId: string, id: string): Promise<DeleteVariantResponse> {
		await waitMock();
		const index = mockVariantsData.findIndex((variant) => variant.id === id && variant.productId === productId);
		if (index >= 0) {
			mockVariantsData.splice(index, 1);
		}
		return {
			id,
			deletedAt: new Date(),
		};
	},

	async bulkUpdatePrice(productId: string, variantIds: string[], price: number): Promise<{ updatedIds: string[] }> {
		await waitMock();
		const updatedIds: string[] = [];
		mockVariantsData.forEach((variant) => {
			if (variant.productId !== productId || !variantIds.includes(variant.id)) {
				return;
			}
			variant.proposedPrice = price;
			variant.updatedAt = nowIso();
			variant.etag = nextEtag();
			updatedIds.push(variant.id);
		});
		return { updatedIds };
	},

};
