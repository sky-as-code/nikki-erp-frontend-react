import {
	mockAttributeValuesData,
	} from '../../mockData/mockAttributeValues';
import {
	nextEtag,
	nowIso,
	waitMock,
} from '../../mockData/utils';

import type {
	AttributeValue,
	CreateAttributeValueRequest,
	CreateAttributeValueResponse,
	DeleteAttributeValueResponse,
	SearchAttributeValuesResponse,
	UpdateAttributeValueRequest,
	UpdateAttributeValueResponse,
} from './types';


const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const attributeValueService = {
	async listAttributeValues(attributeId?: string): Promise<SearchAttributeValuesResponse> {
		await waitMock();
		const items = attributeId
			? mockAttributeValuesData.filter((value) => value.attributeId === attributeId)
			: mockAttributeValuesData;
		return {
			items: clone(items),
			total: items.length,
			page: 1,
			size: items.length,
		};
	},

	async getAttributeValue(id: string): Promise<AttributeValue> {
		await waitMock();
		const item = mockAttributeValuesData.find((value) => value.id === id);
		if (!item) {
			throw new Error('Attribute value not found');
		}
		return clone(item);
	},

	async createAttributeValue(data: CreateAttributeValueRequest): Promise<CreateAttributeValueResponse> {
		await waitMock();
		const id = `aval-${Date.now()}`;
		const createdAt = nowIso();
		const value: AttributeValue = {
			id,
			attributeId: data.attributeId,
			variantId: data.variantId,
			valueText: data.valueText,
			valueNumber: data.valueNumber,
			valueBool: data.valueBool,
			valueRef: data.valueRef,
			variantCount: data.variantCount,
			createdAt,
			updatedAt: createdAt,
			etag: nextEtag(),
		};
		mockAttributeValuesData.unshift(value);
		return {
			id,
			etag: value.etag,
			createdAt: new Date(createdAt),
		};
	},

	async updateAttributeValue(data: UpdateAttributeValueRequest): Promise<UpdateAttributeValueResponse> {
		await waitMock();
		const index = mockAttributeValuesData.findIndex((value) => value.id === data.id);
		if (index < 0) {
			throw new Error('Attribute value not found');
		}
		const current = mockAttributeValuesData[index];
		const updatedAt = nowIso();
		const updated: AttributeValue = {
			...current,
			variantId: data.variantId ?? current.variantId,
			valueText: data.valueText ?? current.valueText,
			valueNumber: data.valueNumber ?? current.valueNumber,
			valueBool: data.valueBool ?? current.valueBool,
			valueRef: data.valueRef ?? current.valueRef,
			variantCount: data.variantCount ?? current.variantCount,
			updatedAt,
			etag: nextEtag(),
		};
		mockAttributeValuesData[index] = updated;
		return {
			id: updated.id,
			etag: updated.etag,
			updatedAt: new Date(updatedAt),
		};
	},

	async deleteAttributeValue(id: string): Promise<DeleteAttributeValueResponse> {
		await waitMock();
		const index = mockAttributeValuesData.findIndex((value) => value.id === id);
		if (index >= 0) {
			mockAttributeValuesData.splice(index, 1);
		}
		return {
			id,
			deletedAt: new Date(),
		};
	},
};
