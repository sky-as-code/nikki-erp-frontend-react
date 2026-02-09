import type { AttributeValue } from '../features/attributeValue/types';
import type { Variant } from '../features/variant/types';


type VariantSeed = {
	productId: string;
	skuPrefix: string;
	proposedPrice: number;
	combos: string[][];
};

type AttributeValueLookup = Pick<AttributeValue, 'id' | 'attributeId' | 'valueText' | 'valueRef'>;

const ATTRIBUTE_VALUE_TIMESTAMP = '2026-01-05T09:00:00.000Z';

const ATTRIBUTE_VALUE_LOOKUP: AttributeValueLookup[] = [
	{ id: 'aval-1', attributeId: 'attr-1', valueText: { en: 'Red' }, valueRef: '#DC2626' },
	{ id: 'aval-2', attributeId: 'attr-1', valueText: { en: 'Blue' }, valueRef: '#2563EB' },
	{ id: 'aval-3', attributeId: 'attr-1', valueText: { en: 'Black' }, valueRef: '#111827' },
	{ id: 'aval-4', attributeId: 'attr-1', valueText: { en: 'White' }, valueRef: '#F3F4F6' },
	{ id: 'aval-5', attributeId: 'attr-2', valueText: { en: 'Small' } },
	{ id: 'aval-6', attributeId: 'attr-2', valueText: { en: 'Medium' } },
	{ id: 'aval-7', attributeId: 'attr-2', valueText: { en: 'Large' } },
	{ id: 'aval-8', attributeId: 'attr-2', valueText: { en: 'Extra Large' } },
	{ id: 'aval-9', attributeId: 'attr-3', valueText: { en: 'Cotton' } },
	{ id: 'aval-10', attributeId: 'attr-3', valueText: { en: 'Polyester' } },
	{ id: 'aval-11', attributeId: 'attr-3', valueText: { en: 'Leather' } },
	{ id: 'aval-12', attributeId: 'attr-3', valueText: { en: 'Wood' } },
	{ id: 'aval-13', attributeId: 'attr-4', valueText: { en: '250 ml' } },
	{ id: 'aval-14', attributeId: 'attr-4', valueText: { en: '500 ml' } },
	{ id: 'aval-15', attributeId: 'attr-4', valueText: { en: '1 Liter' } },
	{ id: 'aval-16', attributeId: 'attr-4', valueText: { en: '2 Liter' } },
	{ id: 'aval-17', attributeId: 'attr-5', valueText: { en: 'Original' } },
	{ id: 'aval-18', attributeId: 'attr-5', valueText: { en: 'Mint' } },
	{ id: 'aval-19', attributeId: 'attr-5', valueText: { en: 'Orange' } },
	{ id: 'aval-20', attributeId: 'attr-5', valueText: { en: 'Berry' } },
];

const valueById = new Map(ATTRIBUTE_VALUE_LOOKUP.map((value) => [value.id, value]));

const toAttributeValues = (ids: string[]): AttributeValue[] => ids
	.map((id) => valueById.get(id))
	.filter((value): value is AttributeValueLookup => Boolean(value))
	.map((value) => ({
		...value,
		createdAt: ATTRIBUTE_VALUE_TIMESTAMP,
		updatedAt: ATTRIBUTE_VALUE_TIMESTAMP,
		etag: `etag-${value.id}`,
	}));

const variantSeeds: VariantSeed[] = [
	{
		productId: 'prod-1',
		skuPrefix: 'TSH',
		proposedPrice: 189000,
		combos: [
			['aval-1', 'aval-5'],
			['aval-1', 'aval-6'],
			['aval-2', 'aval-6'],
			['aval-2', 'aval-7'],
			['aval-3', 'aval-7'],
			['aval-4', 'aval-8'],
		],
	},
	{
		productId: 'prod-2',
		skuPrefix: 'SHO',
		proposedPrice: 899000,
		combos: [
			['aval-1', 'aval-9'],
			['aval-2', 'aval-10'],
			['aval-2', 'aval-11'],
			['aval-3', 'aval-9'],
			['aval-3', 'aval-12'],
			['aval-4', 'aval-11'],
		],
	},
	{
		productId: 'prod-3',
		skuPrefix: 'DRK',
		proposedPrice: 45000,
		combos: [
			['aval-13', 'aval-17'],
			['aval-13', 'aval-18'],
			['aval-14', 'aval-17'],
			['aval-14', 'aval-19'],
			['aval-15', 'aval-19'],
			['aval-16', 'aval-20'],
		],
	},
	{
		productId: 'prod-5',
		skuPrefix: 'MUG',
		proposedPrice: 99000,
		combos: [
			['aval-5', 'aval-9'],
			['aval-5', 'aval-12'],
			['aval-6', 'aval-9'],
			['aval-6', 'aval-10'],
			['aval-7', 'aval-11'],
			['aval-8', 'aval-12'],
		],
	},
	{
		productId: 'prod-8',
		skuPrefix: 'DTG',
		proposedPrice: 145000,
		combos: [
			['aval-1', 'aval-13'],
			['aval-1', 'aval-14'],
			['aval-2', 'aval-14'],
			['aval-2', 'aval-15'],
			['aval-3', 'aval-15'],
			['aval-4', 'aval-16'],
		],
	},
];

let runningIndex = 0;

export const mockVariantsData: Variant[] = variantSeeds.flatMap((seed) => {
	return seed.combos.map((combo, comboIndex) => {
		runningIndex += 1;
		const globalIndex = runningIndex;
		const id = `var-${seed.productId}-${comboIndex + 1}`;
		const values = toAttributeValues(combo);
		const variantDate = new Date(Date.UTC(2026, 0, 10 + comboIndex, comboIndex, 0)).toISOString();
		const valueLabel = (value: AttributeValue) => {
			const text = typeof value.valueText === 'string'
				? value.valueText
				: ((value.valueText as Record<string, string> | undefined)?.en ?? '');
			return text.replace(/\s+/g, '').toUpperCase().substring(0, 5);
		};
		const codeSegment = values.map(valueLabel).join('-');
		const variantName = values
			.map((value) => {
				if (typeof value.valueText === 'string') {
					return value.valueText;
				}
				return (value.valueText as Record<string, string> | undefined)?.en ?? value.id;
			})
			.join(' / ');

		return {
			id,
			productId: seed.productId,
			name: { en: variantName },
			sku: `${seed.skuPrefix}-${codeSegment}`,
			barcode: `893699${String(globalIndex).padStart(6, '0')}`,
			attributeValues: values,
			attributes: {
				attributeValueIds: combo,
			},
			status: comboIndex % 5 === 0 ? 'inactive' : 'active',
			proposedPrice: seed.proposedPrice + comboIndex * 15000,
			createdAt: variantDate,
			updatedAt: variantDate,
			etag: `etag-${id}`,
		};
	});
});
