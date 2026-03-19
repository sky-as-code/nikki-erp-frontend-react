import * as request from '@nikkierp/common/request';

import type {
	Attribute,
	AttributeDisplayType,
	AttributeLangText,
	CreateAttributeRequest,
	CreateAttributeResponse,
	DeleteAttributeResponse,
	SearchAttributesResponse,
	UpdateAttributeRequest,
	UpdateAttributeResponse,
} from './types';


const toDisplayNameText = (value: AttributeLangText | undefined): string => {
	if (typeof value === 'string') {
		return value;
	}

	if (!value) {
		return '';
	}

	return value.en ?? Object.values(value)[0] ?? '';
};

const toCodeName = (value: string): string => {
	return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
};

const mapDisplayTypeToDataType = (displayType?: AttributeDisplayType): string => {
	switch (displayType) {
		case 'button':
		case 'color':
		case 'dropdown':
		default:
			return 'text';
	}
};

const mapDataTypeToDisplayType = (dataType?: string): AttributeDisplayType => {
	switch (dataType) {
		case 'number':
			return 'dropdown';
		case 'bool':
			return 'button';
		case 'text':
		default:
			return 'dropdown';
	}
};

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
