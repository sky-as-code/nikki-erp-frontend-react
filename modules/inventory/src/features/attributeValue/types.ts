import type {
	CreateResponse,
	DeleteResponse,
	SearchResponse,
	UpdateResponse,
} from '@nikkierp/common';


export type AttributeValue = {
	id: string;
	attributeId: string;
	variantId?: string;
	valueText?: string | Record<string, string>;
	valueNumber?: number;
	valueBool?: boolean;
	valueRef?: string;
	variantCount?: number;
	createdAt: string;
	updatedAt: string;
	etag: string;
};

export type CreateAttributeValueRequest = {
	attributeId: string;
	productId?: string;
	variantId?: string;
	valueText?: string | Record<string, string>;
	valueNumber?: number;
	valueBool?: boolean;
	valueRef?: string;
	variantCount?: number;
};

export type UpdateAttributeValueRequest = {
	id: string;
	etag: string;
	variantId?: string;
	valueText?: string | Record<string, string>;
	valueNumber?: number;
	valueBool?: boolean;
	valueRef?: string;
	variantCount?: number;
};

export type SearchAttributeValuesResponse = SearchResponse<AttributeValue>;
export type CreateAttributeValueResponse = CreateResponse;
export type UpdateAttributeValueResponse = UpdateResponse;
export type DeleteAttributeValueResponse = DeleteResponse;
