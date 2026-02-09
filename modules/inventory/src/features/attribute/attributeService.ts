import {
	mockAttributeValuesData,
} from '../../mockData/mockAttributeValues';
import {
	mockAttributesData,
} from '../../mockData/mockAttributes';
import {
	mockProductsData,
} from '../../mockData/mockProducts';
import {
	mockVariantsData,
} from '../../mockData/mockVariants';
import {
	nextEtag,
	nowIso,
	waitMock,
} from '../../mockData/utils';

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


const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

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

const normalizeAttribute = (attribute: Attribute): Attribute => {
	const displayName = attribute.displayName ?? attribute.name ?? attribute.codeName ?? 'Attribute';
	const displayNameText = toDisplayNameText(displayName);
	const codeNameSource = attribute.codeName ?? attribute.code ?? displayNameText;
	const codeName = toCodeName(codeNameSource || 'attribute');
	const dataType = attribute.dataType ?? mapDisplayTypeToDataType(attribute.displayType);
	const enumValue = attribute.enumValue ?? attribute.enumTextValue;

	return {
		...attribute,
		displayName,
		codeName,
		dataType,
		isEnum: attribute.isEnum ?? true,
		isRequired: attribute.isRequired ?? true,
		sortIndex: attribute.sortIndex ?? 0,
		enumValue,
		name: attribute.name ?? displayNameText,
		code: attribute.code ?? codeName.toUpperCase(),
		displayType: attribute.displayType ?? mapDataTypeToDisplayType(dataType),
		groupId: attribute.groupId ?? attribute.attributeGroupId,
		enumTextValue: attribute.enumTextValue ?? enumValue,
		valueCount: mockAttributeValuesData.filter((value) => value.attributeId === attribute.id).length,
	};
};

const findProductAttributeIds = (productId?: string): string[] => {
	if (!productId) {
		return [];
	}
	const product = mockProductsData.find((item) => item.id === productId);
	return product?.attributeIds ?? [];
};

export const attributeService = {
	async listAttributes(productId?: string): Promise<SearchAttributesResponse> {
		await waitMock();
		const productAttributeIds = findProductAttributeIds(productId);
		const items = productId
			? mockAttributesData.filter((attribute) => productAttributeIds.includes(attribute.id))
			: mockAttributesData;
		const normalized = items.map(normalizeAttribute);
		return {
			items: clone(normalized),
			total: normalized.length,
			page: 1,
			size: normalized.length,
		};
	},

	async getAttribute(id: string, _productId?: string): Promise<Attribute> {
		await waitMock();
		const attribute = mockAttributesData.find((item) => item.id === id);
		if (!attribute) {
			throw new Error('Attribute not found');
		}
		return clone(normalizeAttribute(attribute));
	},

	async createAttribute(data: CreateAttributeRequest): Promise<CreateAttributeResponse> {
		await waitMock();
		const createdAt = nowIso();
		const id = `attr-${Date.now()}`;
		const displayName = data.displayName
			?? data.name
			?? data.codeName
			?? data.code
			?? 'New Attribute';
		const displayNameText = toDisplayNameText(displayName);
		const codeName = toCodeName(data.codeName ?? data.code ?? displayNameText ?? 'attribute');
		const dataType = data.dataType ?? mapDisplayTypeToDataType(data.displayType);
		const enumValue = data.enumValue ?? data.enumTextValue;
		const attribute: Attribute = {
			id,
			productId: data.productId,
			attributeGroupId: data.attributeGroupId ?? data.groupId,
			displayName,
			codeName,
			dataType,
			isEnum: data.isEnum ?? true,
			enumValue,
			isRequired: data.isRequired ?? true,
			sortIndex: data.sortIndex ?? 0,
			name: data.name ?? displayNameText,
			code: data.code ?? codeName.toUpperCase(),
			displayType: data.displayType ?? mapDataTypeToDisplayType(dataType),
			groupId: data.groupId,
			enumTextValue: data.enumTextValue ?? enumValue,
			enumNumberValue: data.enumNumberValue,
			createdAt,
			updatedAt: createdAt,
			etag: nextEtag(),
		};
		mockAttributesData.push(attribute);

		if (data.productId) {
			const product = mockProductsData.find((item) => item.id === data.productId);
			if (product) {
				const current = new Set(product.attributeIds ?? []);
				current.add(id);
				product.attributeIds = Array.from(current);
				product.updatedAt = nowIso();
			}
		}

		return {
			id,
			etag: attribute.etag,
			createdAt: new Date(createdAt),
		};
	},

	async updateAttribute(_productId: string, data: UpdateAttributeRequest): Promise<UpdateAttributeResponse> {
		await waitMock();
		const index = mockAttributesData.findIndex((attribute) => attribute.id === data.id);
		if (index < 0) {
			throw new Error('Attribute not found');
		}
		const current = normalizeAttribute(mockAttributesData[index]);
		const displayName = data.displayName ?? data.name ?? current.displayName;
		const displayNameText = toDisplayNameText(displayName);
		const codeName = toCodeName(data.codeName ?? data.code ?? current.codeName);
		const dataType = data.dataType ?? mapDisplayTypeToDataType(data.displayType) ?? current.dataType;
		const enumValue = data.enumValue ?? data.enumTextValue ?? current.enumValue;
		const updatedAt = nowIso();
		const updated: Attribute = {
			...current,
			...data,
			displayName,
			codeName,
			dataType,
			isEnum: data.isEnum ?? current.isEnum,
			enumValue,
			isRequired: data.isRequired ?? current.isRequired,
			sortIndex: data.sortIndex ?? current.sortIndex,
			name: data.name ?? displayNameText,
			code: data.code ?? codeName.toUpperCase(),
			displayType: data.displayType ?? mapDataTypeToDisplayType(dataType),
			attributeGroupId: data.attributeGroupId ?? data.groupId ?? current.attributeGroupId,
			groupId: data.groupId ?? current.groupId,
			enumTextValue: data.enumTextValue ?? current.enumTextValue,
			enumNumberValue: data.enumNumberValue ?? current.enumNumberValue,
			updatedAt,
			etag: nextEtag(),
		};
		mockAttributesData[index] = updated;
		return {
			id: updated.id,
			etag: updated.etag,
			updatedAt: new Date(updatedAt),
		};
	},

	async deleteAttribute(_productId: string, id: string): Promise<DeleteAttributeResponse> {
		await waitMock();
		const index = mockAttributesData.findIndex((attribute) => attribute.id === id);
		if (index >= 0) {
			mockAttributesData.splice(index, 1);
		}

		for (let i = mockAttributeValuesData.length - 1; i >= 0; i -= 1) {
			if (mockAttributeValuesData[i].attributeId === id) {
				mockAttributeValuesData.splice(i, 1);
			}
		}

		mockProductsData.forEach((product) => {
			if (!product.attributeIds?.includes(id)) {
				return;
			}
			product.attributeIds = product.attributeIds.filter((attributeId) => attributeId !== id);
			product.updatedAt = nowIso();
		});

		mockVariantsData.forEach((variant) => {
			variant.attributeValues = variant.attributeValues.filter((value) => value.attributeId !== id);
			variant.updatedAt = nowIso();
		});

		return {
			id,
			deletedAt: new Date(),
		};
	},
};
