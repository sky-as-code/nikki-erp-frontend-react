import type {
	CreateResponse,
	DeleteResponse,
	SearchResponse,
	UpdateResponse,
} from '@nikkierp/common';


export type AttributeDisplayType = 'dropdown' | 'color' | 'button';
export type AttributeLangText = string | Record<string, string>;
export type AttributeDataType = 'text' | 'string' | 'number' | 'bool';
export type EnumValueItem = Record<string, unknown>;

export type Attribute = {
	id: string;
	productId?: string;
	attributeGroupId?: string;
	codeName: string;
	displayName: AttributeLangText;
	dataType: AttributeDataType | string;
	isEnum: boolean;
	enumValue?: EnumValueItem[];
	enumValueSort?: boolean;
	isRequired: boolean;
	sortIndex: number;
	createdAt: string;
	updatedAt: string;
	etag: string;

	// Compatibility fields for existing UI components.
	name?: string;
	code?: string;
	displayType?: AttributeDisplayType;
	valueCount?: number;
	valuesCount?: number;
	variantsCount?: number;
	groupId?: string;
	enumTextValue?: EnumValueItem[];
	enumNumberValue?: number[];
	attributeValues?: unknown[];
	variants?: unknown[];
};

export type CreateAttributeRequest = {
	productId?: string;
	attributeGroupId?: string;
	codeName?: string;
	displayName?: AttributeLangText;
	dataType?: AttributeDataType | string;
	isEnum?: boolean;
	enumValue?: EnumValueItem[];
	enumValueSort?: boolean;
	isRequired?: boolean;
	sortIndex?: number;

	// Compatibility fields for existing create forms.
	name?: string;
	code?: string;
	displayType?: AttributeDisplayType;
	enumTextValue?: EnumValueItem[];
	enumNumberValue?: number[];
	groupId?: string;
};

export type UpdateAttributeRequest = {
	id: string;
	etag: string;
	productId?: string;
	attributeGroupId?: string;
	codeName?: string;
	displayName?: AttributeLangText;
	sortIndex?: number;
	dataType?: AttributeDataType | string;
	isRequired?: boolean;
	isEnum?: boolean;
	enumValue?: EnumValueItem[];
	enumValueSort?: boolean;

	// Compatibility fields for existing update forms.
	name?: string;
	code?: string;
	displayType?: AttributeDisplayType;
	enumTextValue?: EnumValueItem[];
	enumNumberValue?: number[];
	groupId?: string;
};

export type SearchAttributesResponse = SearchResponse<Attribute>;
export type CreateAttributeResponse = CreateResponse;
export type UpdateAttributeResponse = UpdateResponse;
export type DeleteAttributeResponse = DeleteResponse;
