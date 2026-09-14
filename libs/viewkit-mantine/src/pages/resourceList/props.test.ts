import { describe, expect, it } from 'vitest';

import { resourceListPropsSchema } from './props';


const minimal = { schemaName: 'inventory_product_category', translationNs: 'inventory', searchCommand: 'x.search' };

/**
 * Import is opt-in per page: the entry navigates to a route the module must also declare, and the
 * backend serves it only for resources on the composable engine, so a default of "on" would show a
 * button that 404s on every other list.
 */
describe('resourceListPropsSchema.importEnabled', () => {
	it('defaults to off', () => {
		expect(resourceListPropsSchema.parse(minimal).importEnabled).toBe(false);
	});

	it('accepts an explicit opt-in', () => {
		expect(resourceListPropsSchema.parse({ ...minimal, importEnabled: true }).importEnabled).toBe(true);
	});

	it('rejects a non-boolean', () => {
		expect(() => resourceListPropsSchema.parse({ ...minimal, importEnabled: 'yes' })).toThrow();
	});
});

describe('resourceListPropsSchema.displayed_fields', () => {
	function parse(displayedFields: unknown) {
		return resourceListPropsSchema.parse({ ...minimal, displayed_fields: displayedFields });
	}

	it('is absent by default, leaving the column choice to the server', () => {
		expect(resourceListPropsSchema.parse(minimal).displayed_fields).toBeUndefined();
	});

	it('accepts bare field names', () => {
		expect(parse(['sku', 'cost']).displayed_fields).toEqual(['sku', 'cost']);
	});

	it('accepts a field paired with its own label key', () => {
		const entry = { field: 'product_template_name', label: 'fields.product_name' };
		expect(parse([entry]).displayed_fields).toEqual([entry]);
	});

	it('accepts a field one edge deep', () => {
		expect(parse(['product_template.name']).displayed_fields).toEqual(['product_template.name']);
	});

	// The backend resolves a `fields=` selection one dot deep, so a deeper path would fail at the
	// server. Failing here names the field instead of returning a page-wide error.
	it('rejects a path more than one edge deep', () => {
		expect(() => parse(['product_template.uom.name'])).toThrow();
		expect(() => parse([{ field: 'product_template.uom.name', label: 'fields.unit' }])).toThrow();
	});

	it('rejects an empty list rather than requesting no columns', () => {
		expect(() => parse([])).toThrow();
	});

	it('rejects an object without a label, which the bare form already covers', () => {
		expect(() => parse([{ field: 'sku' }])).toThrow();
	});

	it('rejects an unknown key on the object form', () => {
		expect(() => parse([{ field: 'sku', label: 'fields.sku', renderer: 'badge' }])).toThrow();
	});
});
