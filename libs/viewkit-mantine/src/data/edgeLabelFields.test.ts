import { describe, expect, it } from 'vitest';

import { edgeDisplay, edgeLabelFieldNames, toOneEdgeTargets } from './edgeLabelFields';

import type * as dyn from '@nikkierp/common/dynamicModel';


function schema(
	name: string,
	relations: dyn.ModelSchemaRelation[] = [],
	recordLabelField?: string,
): dyn.ModelSchema {
	return {
		name,
		fields: {},
		to_relations: relations,
		record_label_field: recordLabelField,
	} as unknown as dyn.ModelSchema;
}

const uomEdge: dyn.ModelSchemaRelation = {
	edge: 'uom', src_field: 'uom_id', dest_schema_name: 'essential_uom', relation_type: 'many:one',
};
const templateEdge: dyn.ModelSchemaRelation = {
	edge: 'product_template', src_field: 'product_template_id',
	dest_schema_name: 'inventory_product_template', relation_type: 'many:one',
};
// A to-many edge: no src_field, and the server refuses a nested selection through it.
const variantsEdge: dyn.ModelSchemaRelation = {
	edge: 'variants', dest_schema_name: 'inventory_product_variant', relation_type: 'one:many',
};
const tagsEdge: dyn.ModelSchemaRelation = {
	edge: 'tags', dest_schema_name: 'essential_tag', relation_type: 'many:many',
};


describe('toOneEdgeTargets', () => {
	it('returns nothing for a schema with no relations, or none at all', () => {
		expect(toOneEdgeTargets(undefined)).toEqual([]);
		expect(toOneEdgeTargets(schema('inventory_product_variant'))).toEqual([]);
	});

	it('keeps many:one and one:one edges', () => {
		const oneToOne: dyn.ModelSchemaRelation = {
			edge: 'profile', src_field: 'profile_id', dest_schema_name: 'iam_profile',
			relation_type: 'one:one',
		};
		const targets = toOneEdgeTargets(schema('iam_user', [uomEdge, oneToOne]));
		expect(targets).toEqual([
			{ edge: 'uom', destSchemaName: 'essential_uom' },
			{ edge: 'profile', destSchemaName: 'iam_profile' },
		]);
	});

	it('drops to-many edges, which have no single label and which the server refuses', () => {
		const targets = toOneEdgeTargets(schema('x', [uomEdge, variantsEdge, tagsEdge]));
		expect(targets).toEqual([{ edge: 'uom', destSchemaName: 'essential_uom' }]);
	});
});

describe('edgeLabelFieldNames', () => {
	const variant = schema('inventory_product_variant', [uomEdge, templateEdge, variantsEdge]);

	it('builds one dotted selection per edge, from the destination record_label_field', () => {
		const dest = {
			essential_uom: schema('essential_uom', [], 'name'),
			inventory_product_template: schema('inventory_product_template', [], 'name'),
		};
		expect(edgeLabelFieldNames(variant, dest)).toEqual(['uom.name', 'product_template.name']);
	});

	it('honours a label field that is not called name', () => {
		const dest = { essential_uom: schema('essential_uom', [], 'symbol') };
		expect(edgeLabelFieldNames(schema('x', [uomEdge]), dest)).toEqual(['uom.symbol']);
	});

	// The rollout note in wiki 04 §5: record_label_field is not populated on every schema yet.
	it('skips an edge whose destination declares no record_label_field, rather than asking for its id', () => {
		const dest = {
			essential_uom: schema('essential_uom', [], 'name'),
			inventory_product_template: schema('inventory_product_template'),
		};
		expect(edgeLabelFieldNames(variant, dest)).toEqual(['uom.name']);
	});

	it('yields nothing while the destination schemas are still loading', () => {
		expect(edgeLabelFieldNames(variant, {})).toEqual([]);
	});

	it('yields nothing for a schema with no to-one edges', () => {
		expect(edgeLabelFieldNames(schema('x', [variantsEdge]), {})).toEqual([]);
		expect(edgeLabelFieldNames(undefined, {})).toEqual([]);
	});
});

/**
 * The read-mode edge field. Every branch here is a fallback the user sees when something is
 * missing, so each is pinned: a wrong one silently shows a raw ULID or a dead link.
 */
describe('edgeDisplay', () => {
	const uomSchema = schema('essential_uom', [], 'name');
	const ID = '01K5ESS000000000000000UOM1';

	it('links the label to /{module}/{schema}/{id}', () => {
		expect(edgeDisplay(uomEdge, uomSchema, { id: ID, name: 'Kilogram' }, 'essential'))
			.toEqual({ kind: 'link', label: 'Kilogram', href: `/essential/essential_uom/${ID}` });
	});

	it('keeps a LangJson label intact for the caller to localize', () => {
		const label = { en: 'Kilogram', vi: 'Ki-lô-gam' };
		const out = edgeDisplay(uomEdge, uomSchema, { id: ID, name: label }, 'essential');
		expect(out).toEqual({ kind: 'link', label, href: `/essential/essential_uom/${ID}` });
	});

	// A schema no registered micro-app owns has no address; the name still beats the raw id.
	it('renders plain text, not a dead link, when no micro-app owns the schema', () => {
		expect(edgeDisplay(uomEdge, uomSchema, { id: ID, name: 'Kilogram' }, undefined))
			.toEqual({ kind: 'text', label: 'Kilogram' });
	});

	it('renders plain text when the edge carries no usable id', () => {
		expect(edgeDisplay(uomEdge, uomSchema, { name: 'Kilogram' }, 'essential'))
			.toEqual({ kind: 'text', label: 'Kilogram' });
		expect(edgeDisplay(uomEdge, uomSchema, { id: '', name: 'Kilogram' }, 'essential'))
			.toEqual({ kind: 'text', label: 'Kilogram' });
	});

	it('falls back when the foreign key is unset, so the edge is absent or null', () => {
		expect(edgeDisplay(uomEdge, uomSchema, null, 'essential')).toEqual({ kind: 'fallback' });
		expect(edgeDisplay(uomEdge, uomSchema, undefined, 'essential')).toEqual({ kind: 'fallback' });
	});

	// The fetch skips these edges, so nothing is nested under them: read mode shows the raw id,
	// exactly as it did before this feature.
	it('falls back when the destination schema declares no record_label_field', () => {
		expect(edgeDisplay(uomEdge, schema('essential_uom'), { id: ID, name: 'Kilogram' }, 'essential'))
			.toEqual({ kind: 'fallback' });
	});

	it('falls back when the label field is present but empty', () => {
		expect(edgeDisplay(uomEdge, uomSchema, { id: ID, name: '' }, 'essential'))
			.toEqual({ kind: 'fallback' });
		expect(edgeDisplay(uomEdge, uomSchema, { id: ID, name: null }, 'essential'))
			.toEqual({ kind: 'fallback' });
	});
});
