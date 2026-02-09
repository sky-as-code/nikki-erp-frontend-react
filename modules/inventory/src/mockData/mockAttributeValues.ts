import type { AttributeValue } from '../features/attributeValue/types';


const timestamp = '2026-01-05T09:00:00.000Z';

export const mockAttributeValuesData: AttributeValue[] = [
	{ id: 'aval-1', attributeId: 'attr-1', valueText: { en: 'Red' }, valueRef: '#DC2626', variantCount: 4, createdAt: timestamp, updatedAt: timestamp, etag: 'etag-aval-1' },
	{ id: 'aval-2', attributeId: 'attr-1', valueText: { en: 'Blue' }, valueRef: '#2563EB', variantCount: 4, createdAt: timestamp, updatedAt: timestamp, etag: 'etag-aval-2' },
	{ id: 'aval-3', attributeId: 'attr-1', valueText: { en: 'Black' }, valueRef: '#111827', variantCount: 3, createdAt: timestamp, updatedAt: timestamp, etag: 'etag-aval-3' },
	{ id: 'aval-4', attributeId: 'attr-1', valueText: { en: 'White' }, valueRef: '#F3F4F6', variantCount: 3, createdAt: timestamp, updatedAt: timestamp, etag: 'etag-aval-4' },

	{ id: 'aval-5', attributeId: 'attr-2', valueText: { en: 'Small' }, variantCount: 3, createdAt: timestamp, updatedAt: timestamp, etag: 'etag-aval-5' },
	{ id: 'aval-6', attributeId: 'attr-2', valueText: { en: 'Medium' }, variantCount: 4, createdAt: timestamp, updatedAt: timestamp, etag: 'etag-aval-6' },
	{ id: 'aval-7', attributeId: 'attr-2', valueText: { en: 'Large' }, variantCount: 4, createdAt: timestamp, updatedAt: timestamp, etag: 'etag-aval-7' },
	{ id: 'aval-8', attributeId: 'attr-2', valueText: { en: 'Extra Large' }, variantCount: 3, createdAt: timestamp, updatedAt: timestamp, etag: 'etag-aval-8' },

	{ id: 'aval-9', attributeId: 'attr-3', valueText: { en: 'Cotton' }, variantCount: 3, createdAt: timestamp, updatedAt: timestamp, etag: 'etag-aval-9' },
	{ id: 'aval-10', attributeId: 'attr-3', valueText: { en: 'Polyester' }, variantCount: 2, createdAt: timestamp, updatedAt: timestamp, etag: 'etag-aval-10' },
	{ id: 'aval-11', attributeId: 'attr-3', valueText: { en: 'Leather' }, variantCount: 3, createdAt: timestamp, updatedAt: timestamp, etag: 'etag-aval-11' },
	{ id: 'aval-12', attributeId: 'attr-3', valueText: { en: 'Wood' }, variantCount: 3, createdAt: timestamp, updatedAt: timestamp, etag: 'etag-aval-12' },

	{ id: 'aval-13', attributeId: 'attr-4', valueText: { en: '250 ml' }, variantCount: 3, createdAt: timestamp, updatedAt: timestamp, etag: 'etag-aval-13' },
	{ id: 'aval-14', attributeId: 'attr-4', valueText: { en: '500 ml' }, variantCount: 4, createdAt: timestamp, updatedAt: timestamp, etag: 'etag-aval-14' },
	{ id: 'aval-15', attributeId: 'attr-4', valueText: { en: '1 Liter' }, variantCount: 3, createdAt: timestamp, updatedAt: timestamp, etag: 'etag-aval-15' },
	{ id: 'aval-16', attributeId: 'attr-4', valueText: { en: '2 Liter' }, variantCount: 2, createdAt: timestamp, updatedAt: timestamp, etag: 'etag-aval-16' },

	{ id: 'aval-17', attributeId: 'attr-5', valueText: { en: 'Original' }, variantCount: 2, createdAt: timestamp, updatedAt: timestamp, etag: 'etag-aval-17' },
	{ id: 'aval-18', attributeId: 'attr-5', valueText: { en: 'Mint' }, variantCount: 1, createdAt: timestamp, updatedAt: timestamp, etag: 'etag-aval-18' },
	{ id: 'aval-19', attributeId: 'attr-5', valueText: { en: 'Orange' }, variantCount: 2, createdAt: timestamp, updatedAt: timestamp, etag: 'etag-aval-19' },
	{ id: 'aval-20', attributeId: 'attr-5', valueText: { en: 'Berry' }, variantCount: 1, createdAt: timestamp, updatedAt: timestamp, etag: 'etag-aval-20' },
];
