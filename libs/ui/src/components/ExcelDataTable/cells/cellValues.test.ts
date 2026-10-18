import { describe, expect, it } from 'vitest';

import { BadgeFieldRenderer, MoneyFieldRenderer } from './cellRenderers';
import {
	getCellAlignment, getCellText, getCellValue, getFieldSchema, localizeLangJson, renderDataCellContent,
	resolveEdgeLabel,
} from './cellValues';
import { schemaNamespaces, translateSchemaFieldName } from '../fieldLabels';

import type { TranslateFn } from '../../../i18n';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type React from 'react';


const variantSchema = {
	name: 'inventory_product_variant',
	fields: { sku: { name: 'sku', label: { 'en-US': 'SKU' } } },
	to_relations: [{
		edge: 'product_template',
		src_field: 'product_template_id',
		dest_schema_name: 'inventory_product_template',
		relation_type: 'many:one',
	}],
} as unknown as dyn.ModelSchema;

const templateSchema = {
	name: 'inventory_product_template',
	record_label_field: 'name',
	fields: { name: { name: 'name', label: { 'en-US': 'Name' } } },
} as unknown as dyn.ModelSchema;

const related = { inventory_product_template: templateSchema };

describe('getCellValue', () => {
	// The server nests a selected edge field under the edge name, so a dotted column is a path to
	// walk and never a key on the row itself.
	it('walks into the nested edge object', () => {
		const row = { sku: 'ABC', product_template: { name: 'Coca Cola' } };
		expect(getCellValue(row, 'product_template.name')).toBe('Coca Cola');
	});

	it('reads a flat field directly', () => {
		expect(getCellValue({ sku: 'ABC' }, 'sku')).toBe('ABC');
	});

	it('is undefined when the path runs into a missing or non-object link', () => {
		expect(getCellValue({}, 'product_template.name')).toBeUndefined();
		expect(getCellValue({ product_template: null }, 'product_template.name')).toBeUndefined();
		expect(getCellValue({ product_template: 'x' }, 'product_template.name')).toBeUndefined();
		expect(getCellValue(undefined, 'sku')).toBeUndefined();
	});
});

describe('getCellText', () => {
	it('renders a nested value as text', () => {
		const row = { product_template: { name: 'Coca Cola' } };
		expect(getCellText(row, 'product_template.name', [])).toBe('Coca Cola');
	});

	it('is blank for an absent nested value rather than "undefined"', () => {
		expect(getCellText({}, 'product_template.name', [])).toBe('');
	});

	it('still masks a masked field', () => {
		const row = { product_template: { name: 'Coca Cola' } };
		expect(getCellText(row, 'product_template.name', ['product_template.name'])).toBe('********');
	});
});

describe('getFieldSchema', () => {
	it('reads a flat field off the schema itself', () => {
		expect(getFieldSchema(variantSchema, 'sku', related)?.name).toBe('sku');
	});

	it('walks one edge to the destination schema', () => {
		expect(getFieldSchema(variantSchema, 'product_template.name', related)?.name).toBe('name');
	});

	// The related schema arrives a render later than the list's own, so a miss has to stay a miss
	// rather than mislabelling the column or picking the wrong filter input for it.
	it('is undefined while the related schema is still loading', () => {
		expect(getFieldSchema(variantSchema, 'product_template.name', {})).toBeUndefined();
	});

	it('is undefined for an unknown edge, leaf or schema', () => {
		expect(getFieldSchema(variantSchema, 'nope.name', related)).toBeUndefined();
		expect(getFieldSchema(variantSchema, 'product_template.nope', related)).toBeUndefined();
		expect(getFieldSchema(undefined, 'sku', related)).toBeUndefined();
	});
});

describe('resolveEdgeLabel', () => {
	it('shows the target record label for a foreign-key column when the edge object is present', () => {
		const row = { product_template_id: '01H', product_template: { name: 'Coca Cola' } };
		expect(resolveEdgeLabel(row, 'product_template_id', variantSchema, related)).toBe('Coca Cola');
	});

	it('localizes a lang-json label, falling back to another language before giving up', () => {
		const row = { product_template_id: '01H', product_template: { name: { 'en-US': 'Cola', 'vi-VN': 'Nước ngọt' } } };
		expect(resolveEdgeLabel(row, 'product_template_id', variantSchema, related, 'vi-VN')).toBe('Nước ngọt');
		expect(resolveEdgeLabel(row, 'product_template_id', variantSchema, related, 'fr-FR')).toBe('Cola');
	});

	it('translates a `$ref` record label against the module owning the edge schema', () => {
		const row = { product_template_id: '01H', product_template: { name: { $ref: 'tpl.cola', 'en-US': 'Cola' } } };
		const calls: string[] = [];
		const translate = (key: string, schemaName: string) => {
			calls.push(`${schemaName}:${key}`);
			return key === 'tpl.cola' ? 'Cô-ca' : undefined;
		};
		expect(resolveEdgeLabel(row, 'product_template_id', variantSchema, related, 'vi-VN', translate)).toBe('Cô-ca');
		expect(calls).toEqual(['inventory_product_template:tpl.cola']);
	});

	it('falls back to the texts of a `$ref` record label whose key is not translated', () => {
		const row = { product_template_id: '01H', product_template: { name: { $ref: 'tpl.cola', 'en-US': 'Cola' } } };
		expect(resolveEdgeLabel(row, 'product_template_id', variantSchema, related, 'vi-VN', () => undefined))
			.toBe('Cola');
	});

	it('is undefined when the column is not a foreign key, the schema is missing or the edge was not selected', () => {
		const row = { product_template_id: '01H' };
		expect(resolveEdgeLabel(row, 'sku', variantSchema, related)).toBeUndefined();
		expect(resolveEdgeLabel(row, 'product_template_id', variantSchema, {})).toBeUndefined();
		expect(resolveEdgeLabel(row, 'product_template_id', variantSchema, related)).toBeUndefined();
		expect(resolveEdgeLabel(row, 'product_template_id', undefined, related)).toBeUndefined();
	});
});

describe('getCellAlignment', () => {
	it('right-aligns numbers and money, left-aligns everything else', () => {
		const decimal = { name: 'p', data_type: { name: 'decimal' } } as unknown as dyn.ModelSchemaField;
		const text = { name: 't', data_type: 'string' } as unknown as dyn.ModelSchemaField;
		expect(getCellAlignment(decimal, undefined)).toBe('right');
		expect(getCellAlignment(text, undefined)).toBe('left');
		expect(getCellAlignment(text, new MoneyFieldRenderer('$'))).toBe('right');
		expect(getCellAlignment(undefined, undefined)).toBe('left');
	});
});

describe('renderDataCellContent for enums', () => {
	type BadgeElement = React.ReactElement<{ color?: string, children?: React.ReactNode }>;
	const statusField = {
		name: 'status', data_type: { name: 'enumString', options: { enumValues: ['active', 'locked'] } },
	} as unknown as dyn.ModelSchemaField;
	const tagsField = {
		name: 'tags', data_type: { name: 'enumString', is_array: true },
	} as unknown as dyn.ModelSchemaField;
	const translations: Record<string, string> = { 'status.active': 'Active' };
	const t = ((key: string) => translations[key] ?? `iam:${key}`) as unknown as TranslateFn;

	it('renders a gray badge labelled with the {field}.{value} translation', () => {
		const node = renderDataCellContent('active', 'active', statusField, undefined, t) as BadgeElement;
		expect(node.props.color).toBe('gray');
		expect(node.props.children).toBe('Active');
	});

	it('falls back to the stored value when the key is untranslated', () => {
		const node = renderDataCellContent('locked', 'locked', statusField, undefined, t) as BadgeElement;
		expect(node.props.children).toBe('locked');
	});

	it('renders nothing for an empty value', () => {
		expect(renderDataCellContent(null, '', statusField, undefined, t)).toBe('');
	});

	it('lets a page renderer override the default', () => {
		const renderer = new BadgeFieldRenderer({ colorMap: { active: 'green' } });
		const node = renderDataCellContent('active', 'active', statusField, renderer, t) as BadgeElement;
		expect(node.props.color).toBe('green');
	});

	it('hands the whole row to a raw renderer', () => {
		const record = { id: 'r1', status: 'active', is_draft: true };
		const renderer = {
			render: (text: string) => text,
			renderRaw: (raw: unknown, text: string, row?: Record<string, unknown>) => `${text}:${String(row?.is_draft)}`,
		};
		expect(renderDataCellContent('active', 'active', statusField, renderer, t, record)).toBe('active:true');
		expect(renderDataCellContent('active', 'active', statusField, renderer, t)).toBe('active:undefined');
	});

	it('renders one badge per element of an array enum', () => {
		const nodes = renderDataCellContent(['a', 'b'], 'a,b', tagsField, undefined, t) as BadgeElement[];
		expect(nodes).toHaveLength(2);
		const first = nodes[0].props.children as React.ReactNode[];
		expect((first[0] as BadgeElement).props.color).toBe('gray');
	});
});

describe('localizeLangJson', () => {
	it('prefers the `$ref` translation, then the language, then any text, never the key itself', () => {
		const translate = (key: string) => (key === 'known' ? 'Translated' : undefined);
		expect(localizeLangJson({ $ref: 'known', 'en-US': 'Plain' }, 'en-US', translate)).toBe('Translated');
		expect(localizeLangJson({ $ref: 'unknown', 'en-US': 'Plain' }, 'en-US', translate)).toBe('Plain');
		expect(localizeLangJson({ 'en-US': 'Plain' }, 'vi-VN')).toBe('Plain');
		expect(localizeLangJson({ $ref: 'unknown' }, 'vi-VN', translate)).toBeUndefined();
	});
});

describe('translateSchemaFieldName', () => {
	const entitlementSchema = {
		name: 'iam_entitlement',
		fields: {
			resource_id: { name: 'resource_id', label: { $ref: 'resource' } },
			code: { name: 'code', label: { 'en-US': 'Code' } },
			bare: { name: 'bare' },
		},
		to_relations: [{
			edge: 'template', src_field: 'template_id', dest_schema_name: 'inventory_product_template',
		}],
	} as unknown as dyn.ModelSchema;
	const translate = (key: string, schemaName: string) => `${schemaName}/${key}`;

	it('resolves a `$ref` label against the schema owning the field, walking a dotted edge', () => {
		expect(translateSchemaFieldName('resource_id', entitlementSchema, related, 'en-US', translate))
			.toBe('iam_entitlement/resource');
		expect(translateSchemaFieldName('template.name', entitlementSchema, related, 'en-US', translate)).toBe('Name');
		expect(translateSchemaFieldName('code', entitlementSchema, related, 'en-US', translate)).toBe('Code');
	});

	it('falls back to the field name when the schema, the field or its label is unknown', () => {
		expect(translateSchemaFieldName('code', undefined, related, 'en-US', translate)).toBe('code');
		expect(translateSchemaFieldName('nope', entitlementSchema, related, 'en-US', translate)).toBe('nope');
		expect(translateSchemaFieldName('bare', entitlementSchema, related, 'en-US', translate)).toBe('bare');
		expect(translateSchemaFieldName('resource_id', entitlementSchema, related, 'en-US', () => undefined))
			.toBe('resource_id');
	});

	it('lists each module namespace once', () => {
		expect(schemaNamespaces(entitlementSchema, { ...related, iam_resource: templateSchema })).toEqual([
			'iam', 'inventory',
		]);
	});
});
