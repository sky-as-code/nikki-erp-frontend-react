import * as request from '@nikkierp/common/request';

import type {
	Attribute,
	CreateAttributeRequest,
	CreateAttributeResponse,
	DeleteAttributeResponse,
	SearchAttributesResponse,
	UpdateAttributeRequest,
	UpdateAttributeResponse,
} from './types';

export const attributeService = {
	async listAttributes(orgId: string, productId: string): Promise<SearchAttributesResponse> {
		const response = await request.get<SearchAttributesResponse>(
			`${orgId}/inventory/products/${productId}/attributes`
		);
		return response;
	},

	async getAttribute(
		orgId: string,
		productId: string,
		id: string,
	): Promise<Attribute> {
		const response = await request.get<Attribute>(
			`${orgId}/inventory/products/${productId}/attributes/${id}`
		);
		return response;
	},

	async createAttribute(orgId: string, data: CreateAttributeRequest): Promise<CreateAttributeResponse> {
		const productId = data.productId || '';
		const response = await request.post<CreateAttributeResponse>(
			`${orgId}/inventory/products/${productId}/attributes`,
			{ json: data }
		);
		return response;
	},

	async updateAttribute(
		orgId: string,
		productId: string,
		data: UpdateAttributeRequest,
	): Promise<UpdateAttributeResponse> {
		const response = await request.put<UpdateAttributeResponse>(
			`${orgId}/inventory/products/${productId}/attributes/${data.id}`,
			{ json: data }
		);
		return response;
	},

	async deleteAttribute(orgId: string, productId: string, id: string): Promise<DeleteAttributeResponse> {
		const response = await request.del<DeleteAttributeResponse>(
			`${orgId}/inventory/products/${productId}/attributes/${id}`
		);
		return response;
	},
};
