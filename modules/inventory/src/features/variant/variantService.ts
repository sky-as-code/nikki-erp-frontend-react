import * as request from '@nikkierp/common/request';

import type {
	CreateVariantRequest,
	CreateVariantResponse,
	DeleteVariantResponse,
	SearchVariantsResponse,
	UpdateVariantRequest,
	UpdateVariantResponse,
	Variant,
} from './types';

export const variantService = {
	async listVariants(orgId: string, productId: string): Promise<SearchVariantsResponse> {
		const response = await request.get<SearchVariantsResponse>(
			`${orgId}/inventory/products/${productId}/variants`
		);
		return response;
	},

	async listAllVariants(orgId: string): Promise<SearchVariantsResponse> {
		const response = await request.get<SearchVariantsResponse>(`${orgId}/inventory/variants`);
		return response;
	},

	async getVariant(orgId: string, id: string, productId?: string): Promise<Variant> {
		const url = productId 
			? `${orgId}/inventory/products/${productId}/variants/${id}`
			: `${orgId}/inventory/variants/${id}`;
		const response = await request.get<Variant>(url);
		return response;
	},

	async createVariant(orgId: string, data: CreateVariantRequest): Promise<CreateVariantResponse> {
		const response = await request.post<CreateVariantResponse>(
			`${orgId}/inventory/products/${data.productId}/variants`,
			{ json: data }
		);
		return response;
	},

	async updateVariant(orgId: string, productId: string, data: UpdateVariantRequest): Promise<UpdateVariantResponse> {
		const response = await request.put<UpdateVariantResponse>(
			`${orgId}/inventory/products/${productId}/variants/${data.id}`,
			{ json: data }
		);
		return response;
	},

	async deleteVariant(orgId: string, productId: string, id: string): Promise<DeleteVariantResponse> {
		const response = await request.del<DeleteVariantResponse>(
			`${orgId}/inventory/products/${productId}/variants/${id}`
		);
		return response;
	},
};
