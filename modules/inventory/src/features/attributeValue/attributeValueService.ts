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
	async listAttributeValues(attributeId?: string): Promise<SearchAttributeValuesResponse> {
		const response = await request.get<SearchAttributeValuesResponse>(
			'inventory/attribute-values',
			{ searchParams: attributeId ? { attributeId } : {} }
		);
		return response;
	},

	async getAttributeValue(id: string): Promise<AttributeValue> {
		const response = await request.get<AttributeValue>(`inventory/attribute-values/${id}`);
		return response;
	},

	async createAttributeValue(data: CreateAttributeValueRequest): Promise<CreateAttributeValueResponse> {
		const response = await request.post<CreateAttributeValueResponse>(
			'inventory/attribute-values',
			{ json: data }
		);
		return response;
	},

	async updateAttributeValue(data: UpdateAttributeValueRequest): Promise<UpdateAttributeValueResponse> {
		const response = await request.put<UpdateAttributeValueResponse>(
			`inventory/attribute-values/${data.id}`,
			{ json: data }
		);
		return response;
	},

	async deleteAttributeValue(id: string): Promise<DeleteAttributeValueResponse> {
		const response = await request.del<DeleteAttributeValueResponse>(
			`inventory/attribute-values/${id}`
		);
		return response;
	},
};
