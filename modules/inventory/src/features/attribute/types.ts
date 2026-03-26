import type {
	CreateResponse,
	DeleteResponse,
	SearchResponse,
	UpdateResponse,
} from '@nikkierp/common';

export type Attribute = {
	id: string;
	productId: string;
	codeName: string;
	displayName: Record<string, string>; 
	dataType: string;
	isRequired?: boolean;
	isEnum?: boolean;
	enumValue?: Record<string, unknown>[];
	enumValueSort?: boolean;
	sortIndex?: number;
	groupId?: string;
	valuesCount?: number;
	variantsCount?: number;
	createdAt: number; 
	updatedAt?: number;
	etag: string;

	attributeValues?: unknown[];
	variants?: unknown[];
};

export type CreateAttributeRequest = {
	productId: string;
	codeName: string; 
	displayName: Record<string, string>; 
	dataType: string; 
	isRequired: boolean;
	isEnum?: boolean;
	enumValue?: Record<string, unknown>[];
	enumValueSort?: boolean;
	sortIndex?: number;
	groupId?: string;
};

export type UpdateAttributeRequest = {
	id: string;
	productId: string;
	etag: string;
	codeName?: string;
	displayName?: Record<string, string>;
	sortIndex?: number;
	dataType?: string;
	isRequired?: boolean;
	isEnum?: boolean;
	enumValue?: Record<string, unknown>[];
	enumValueSort?: boolean;
	groupId?: string;
};

export type SearchAttributesResponse = SearchResponse<Attribute>;
export type CreateAttributeResponse = CreateResponse;
export type UpdateAttributeResponse = UpdateResponse;
export type DeleteAttributeResponse = DeleteResponse;
