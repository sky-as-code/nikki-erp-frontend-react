import { describe, expect, it } from 'vitest';

import { edgeDisplay } from './edgeDisplay';

import type * as dyn from '@nikkierp/common/dynamicModel';


const uomEdge: dyn.ModelSchemaRelation = {
	edge: 'uom', src_field: 'uom_id', dest_schema_name: 'essential_uom', relation_type: 'many:one',
};

/**
 * The read-mode edge field. Every branch here is a fallback the user sees when something is
 * missing, so each is pinned: a wrong one silently shows a raw ULID or a dead link.
 */
describe('edgeDisplay', () => {
	const uomLabel = 'name';
	const ID = '01K5ESS000000000000000UOM1';

	it('links the label to /{module}/{schema}/{id}', () => {
		expect(edgeDisplay(uomEdge, uomLabel, { id: ID, name: 'Kilogram' }, 'essential'))
			.toEqual({ kind: 'link', label: 'Kilogram', href: `/essential/essential_uom/${ID}` });
	});

	it('keeps a LangJson label intact for the caller to localize', () => {
		const label = { en: 'Kilogram', vi: 'Ki-lô-gam' };
		const out = edgeDisplay(uomEdge, uomLabel, { id: ID, name: label }, 'essential');
		expect(out).toEqual({ kind: 'link', label, href: `/essential/essential_uom/${ID}` });
	});

	// A schema no registered micro-app owns has no address; the name still beats the raw id.
	it('renders plain text, not a dead link, when no micro-app owns the schema', () => {
		expect(edgeDisplay(uomEdge, uomLabel, { id: ID, name: 'Kilogram' }, undefined))
			.toEqual({ kind: 'text', label: 'Kilogram' });
	});

	it('renders plain text when the edge carries no usable id', () => {
		expect(edgeDisplay(uomEdge, uomLabel, { name: 'Kilogram' }, 'essential'))
			.toEqual({ kind: 'text', label: 'Kilogram' });
		expect(edgeDisplay(uomEdge, uomLabel, { id: '', name: 'Kilogram' }, 'essential'))
			.toEqual({ kind: 'text', label: 'Kilogram' });
	});

	it('falls back when the foreign key is unset, so the edge is absent or null', () => {
		expect(edgeDisplay(uomEdge, uomLabel, null, 'essential')).toEqual({ kind: 'fallback' });
		expect(edgeDisplay(uomEdge, uomLabel, undefined, 'essential')).toEqual({ kind: 'fallback' });
	});

	// The BFF names no label for an edge whose destination declares no record_label_field, and
	// selects nothing under it: read mode shows the raw id.
	it('falls back when the read named no label field for the edge', () => {
		expect(edgeDisplay(uomEdge, undefined, { id: ID, name: 'Kilogram' }, 'essential'))
			.toEqual({ kind: 'fallback' });
	});

	it('falls back when the label field is present but empty', () => {
		expect(edgeDisplay(uomEdge, uomLabel, { id: ID, name: '' }, 'essential'))
			.toEqual({ kind: 'fallback' });
		expect(edgeDisplay(uomEdge, uomLabel, { id: ID, name: null }, 'essential'))
			.toEqual({ kind: 'fallback' });
	});
});
