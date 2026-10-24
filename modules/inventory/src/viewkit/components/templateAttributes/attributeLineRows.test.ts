import { describe, expect, it } from 'vitest';

import {
	applyRowUpdate, configureColumns, configureDisabledReason, configureHref, isChangedLineRow, isNewLineRow,
	linesToRows, readNewLine,
} from './attributeLineRows';
import { addLineWith, buildConfigContribution, configFromRecord, reorderLines } from './templateConfigDrafts';

import type { AttributeCatalogue } from './attributeCatalogue';


const SAVED = {
	attribute_lines: [
		{ id: 'l1', attribute_id: 'color', value_ids: ['red', 'blue'], sequence: 1, variant_creation_snapshot: 'instant' },
		{ id: 'l2', attribute_id: 'size', value_ids: ['s', 'm'], sequence: 2, variant_creation_snapshot: 'dynamic' },
		{ id: 'l3', attribute_id: 'fit', value_ids: ['slim'], sequence: 3 },
	],
	exclusions: [],
};

const catalogue = {
	attributes: new Map([['fit', { id: 'fit', name: 'Fit', code: 'fit', mode: 'never', isArchived: false }]]),
	values: new Map(),
	valuesOf: () => [],
	isLoading: false,
} as unknown as AttributeCatalogue;

describe('attribute line rows', () => {
	it('keys each row by its draft key and carries the saved line id and mode', () => {
		const rows = linesToRows(configFromRecord(SAVED), catalogue);

		expect(rows.map(row => [row.id, row.line_id, row.variant_creation])).toEqual([
			['line:1', 'l1', 'instant'], ['line:2', 'l2', 'dynamic'], ['line:3', 'l3', 'never'],
		]);
		expect(rows[0]).toMatchObject({ etag: 'draft', attribute_id: 'color', value_ids: ['red', 'blue'] });
	});

	it('renumbers the sequence 1..n in the dragged order, and sends it with the save', () => {
		const saved = configFromRecord(SAVED);
		const [color, size, fit] = saved.lines.map(line => line.key);
		const sorted = reorderLines(saved, [fit, color, size]);

		expect(sorted.lines.map(line => [line.attributeId, line.sequence])).toEqual([['fit', 1], ['color', 2], ['size', 3]]);
		expect(buildConfigContribution(saved, sorted)?.payload.attribute_lines).toEqual([
			{ attribute_id: 'fit', value_ids: ['slim'], sequence: 1 },
			{ attribute_id: 'color', value_ids: ['red', 'blue'], sequence: 2 },
			{ attribute_id: 'size', value_ids: ['s', 'm'], sequence: 3 },
		]);
		expect(buildConfigContribution(saved, reorderLines(saved, [color, size, fit]))).toBeUndefined();
	});

	it('adds an inserted line last and keeps it last after a drag of the others', () => {
		const saved = configFromRecord(SAVED);
		const added = addLineWith(saved, 'fabric', ['cotton']);
		const fabric = added.lines[3];
		const sorted = reorderLines(added, [added.lines[1].key, added.lines[0].key]);

		expect(fabric).toMatchObject({ attributeId: 'fabric', valueIds: ['cotton'], sequence: 4, id: undefined });
		expect(sorted.lines.map(line => [line.attributeId, line.sequence])).toEqual([
			['size', 1], ['color', 2], ['fit', 3], ['fabric', 4],
		]);
	});

	it('applies a row write: another attribute clears the values, the values sent with it then apply', () => {
		const saved = configFromRecord(SAVED);
		const key = saved.lines[0].key;

		expect(applyRowUpdate(saved, { id: key, etag: 'draft', value_ids: ['red'] }).lines[0].valueIds).toEqual(['red']);
		expect(applyRowUpdate(saved, { id: key, etag: 'draft', attribute_id: 'fabric', value_ids: [] }).lines[0])
			.toMatchObject({ attributeId: 'fabric', valueIds: [], id: undefined });
	});

	it('reads an insert row only once it names an attribute', () => {
		expect(readNewLine({ value_ids: ['x'] })).toBeNull();
		expect(readNewLine({ attribute_id: 'color' })).toEqual({ attributeId: 'color', valueIds: [] });
	});

	it('marks a line not saved as new and an edited saved line as changed', () => {
		const saved = configFromRecord(SAVED);
		const draft = applyRowUpdate(addLineWith(saved, 'fabric', []), { id: 'line:2', value_ids: ['s'] });
		const rows = linesToRows(draft, catalogue);

		expect(rows.map(row => isNewLineRow(saved, row))).toEqual([false, false, false, true]);
		expect(rows.map(row => isChangedLineRow(saved, draft, row))).toEqual([false, true, false, false]);
	});
});

describe('Configure on an attribute line', () => {
	const rows = linesToRows(addLineWith(configFromRecord(SAVED), 'fabric', []), catalogue);

	it('is enabled only for a saved line', () => {
		expect(configureDisabledReason(rows[0], 'Save first')).toBe(false);
		expect(configureDisabledReason(rows[3], 'Save first')).toBe('Save first');
	});

	it('is hidden in edit mode, which navigating away would discard, and shown after Values otherwise', () => {
		const labels = { configure: 'Configure', saveFirst: 'Save first' };

		expect(configureColumns(true, labels, undefined)).toEqual([]);
		const [column] = configureColumns(false, labels, undefined);
		expect(column).toMatchObject({ key: 'configure', afterField: 'value_ids' });
		expect(column.actions[0]).toMatchObject({ type: 'action_link', label: 'Configure' });
		expect(column.actions[0].href?.(rows[0])).toBe(configureHref('l1'));
	});

	it('opens the inventory extra-price list of that line, whichever module shows the template', () => {
		const href = configureHref('l1');
		const [path, query] = href.split('?');

		expect(path).toBe('/inventory/inventory_product_template_attribute_value');
		expect(JSON.parse(new URLSearchParams(query).get('initialGraph') ?? '')).toEqual({
			if: ['template_attribute_id', '=', 'l1'], order: [['sequence', 'asc']],
		});
	});
});
