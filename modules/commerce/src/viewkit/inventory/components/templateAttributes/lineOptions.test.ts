import { describe, expect, it } from 'vitest';

import { LINE_TABLE_SCHEMA } from './attributeLineRows';
import {
	attributePickerGraph, mergePickedValues, selectableAttributes, selectableValues, valuePickerGraph,
} from './lineOptions';
import { addLineWith, configFromRecord, removeLine } from './templateConfigDrafts';

import type { AttributeCatalogue, CatalogueAttribute, CatalogueValue } from './attributeCatalogue';


function attribute(id: string, isArchived = false): CatalogueAttribute {
	return { id, name: id, code: id, mode: 'instant', isArchived };
}

function value(id: string, attributeId: string, sequence: number, isArchived = false): CatalogueValue {
	return { id, attributeId, name: id, code: id, isArchived, sequence };
}

const VALUES = [value('red', 'color', 1), value('teal', 'color', 2, true), value('blue', 'color', 3), value('s', 'size', 1)];

const catalogue: AttributeCatalogue = {
	attributes: new Map(['color', 'size', 'fit', 'fabric'].map(id => [id, attribute(id)] as const)
		.concat([['old', attribute('old', true)]])),
	values: new Map(VALUES.map(item => [item.id, item])),
	valuesOf: (attributeId: string) => VALUES.filter(item => item.attributeId === attributeId),
	isLoading: false,
};

const SAVED = configFromRecord({
	attribute_lines: [
		{ id: 'l1', attribute_id: 'color', value_ids: ['red'], sequence: 1 },
		{ id: 'l2', attribute_id: 'size', value_ids: ['s'], sequence: 2 },
	],
	exclusions: [],
});

const ids = (items: Array<{ id: string }>) => items.map(item => item.id);

describe('the insert row attribute options', () => {
	it('leave out the attributes of saved lines, unsaved lines and archived attributes', () => {
		const draft = addLineWith(SAVED, 'fit', []);

		expect(ids(selectableAttributes(catalogue, draft, ''))).toEqual(['fabric']);
	});

	it('offer again the attribute of a line removed in this edit', () => {
		const draft = removeLine(SAVED, SAVED.lines[1].key);

		expect(ids(selectableAttributes(catalogue, draft, ''))).toEqual(['size', 'fit', 'fabric']);
	});

	it('keep the row\'s own pick listed', () => {
		expect(ids(selectableAttributes(catalogue, SAVED, 'old'))).toEqual(['fit', 'fabric', 'old']);
	});

	it('scope the "Browse all" picker to attributes no line holds', () => {
		expect(attributePickerGraph(addLineWith(SAVED, 'fit', []))).toEqual({ if: ['id', 'not_in', 'color', 'size', 'fit'] });
		expect(attributePickerGraph(configFromRecord({ attribute_lines: [], exclusions: [] }))).toBeUndefined();
	});

	it('never let a saved line change its attribute', () => {
		expect(LINE_TABLE_SCHEMA.fields.attribute_id.no_update).toBe(true);
	});
});

describe('the values options', () => {
	it('list the attribute\'s active values and the archived ones already selected', () => {
		expect(ids(selectableValues(catalogue, 'color', []))).toEqual(['red', 'blue']);
		expect(ids(selectableValues(catalogue, 'color', ['teal']))).toEqual(['red', 'teal', 'blue']);
	});

	it('scope the "Browse all" picker to the attribute, and keep archived picks it cannot list', () => {
		expect(valuePickerGraph('color')).toEqual({ if: ['attribute_id', '=', 'color'] });
		expect(mergePickedValues(catalogue, ['teal', 'red'], ['blue'])).toEqual(['teal', 'blue']);
	});
});
