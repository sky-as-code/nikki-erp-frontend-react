import * as request from '@nikkierp/common/request';

import type {
	AttributeValue,
	CreateAttributeValueRequest,
	CreateAttributeValueResponse,
	DeleteAttributeValueResponse,
	SearchAttributeValuesResponse,
	UpdateAttributeValueRequest,
	UpdateAttributeValueResponse,
} from './types';


export const attributeValueService = {
	async listAttributeValues(
		orgId: string,
		productId: string,
		attributeId: string,
		searchParams?: Record<string, string | number | boolean | undefined>,
	): Promise<SearchAttributeValuesResponse> {
		const response = await request.get<SearchAttributeValuesResponse>(
			`${orgId}/inventory/products/${productId}/attributes/${attributeId}/values`,
			{ searchParams },
		);
		return response;
	},

	async getAttributeValue(
		orgId: string,
		productId: string,
		attributeId: string,
		id: string,
	): Promise<AttributeValue> {
		const response = await request.get<AttributeValue>(
			`${orgId}/inventory/products/${productId}/attributes/${attributeId}/values/${id}`,
		);
		return response;
	},

	async createAttributeValue(
		orgId: string,
		productId: string,
		attributeId: string,
		data: CreateAttributeValueRequest,
	): Promise<CreateAttributeValueResponse> {
		const response = await request.post<CreateAttributeValueResponse>(
			`${orgId}/inventory/products/${productId}/attributes/${attributeId}/values`,
			{ json: data },
		);
		return response;
	},

	async updateAttributeValue(
		orgId: string,
		productId: string,
		attributeId: string,
		data: UpdateAttributeValueRequest,
	): Promise<UpdateAttributeValueResponse> {
		const response = await request.put<UpdateAttributeValueResponse>(
			`${orgId}/inventory/products/${productId}/attributes/${attributeId}/values/${data.id}`,
			{ json: data },
		);
		return response;
	},

	async deleteAttributeValue(
		orgId: string,
		productId: string,
		attributeId: string,
		id: string,
	): Promise<DeleteAttributeValueResponse> {
		const response = await request.del<DeleteAttributeValueResponse>(
			`${orgId}/inventory/products/${productId}/attributes/${attributeId}/values/${id}`,
		);
		return response;
	},
};
