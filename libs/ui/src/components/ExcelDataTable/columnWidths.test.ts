import { describe, expect, it } from 'vitest';

import {
	defaultColumnWidth, getColumnCount, getRowActionsMinWidth, getTableMinWidth, rowNumberColumnWidth,
} from './columnWidths';


describe('getColumnCount', () => {
	it('counts the index, every field and the filler by default', () => {
		expect(getColumnCount(3)).toBe(5);
	});

	it('leaves the index column out when it is hidden', () => {
		expect(getColumnCount(3, { indexColumnVisible: false, fillerMinWidth: 0 })).toBe(4);
	});
});

describe('getTableMinWidth', () => {
	const widths = { name: 120 };

	it('sums the index column and the field widths, falling back to the default width', () => {
		expect(getTableMinWidth(['name', 'code'], widths)).toBe(rowNumberColumnWidth + 120 + defaultColumnWidth);
	});

	it('drops the index column when hidden', () => {
		expect(getTableMinWidth(['name'], widths, { indexColumnVisible: false, fillerMinWidth: 0 })).toBe(120);
	});

	it('reserves the filler minimum, so widening a column grows the table', () => {
		const layout = { indexColumnVisible: true, fillerMinWidth: 150 };
		expect(getTableMinWidth(['name'], widths, layout)).toBe(rowNumberColumnWidth + 120 + 150);
		expect(getTableMinWidth(['name'], { name: 300 }, layout)).toBe(rowNumberColumnWidth + 300 + 150);
	});
});

describe('getRowActionsMinWidth', () => {
	it('reserves nothing for a read-only table', () => {
		expect(getRowActionsMinWidth([])).toBe(0);
	});

	it('reserves room for the delete button, and more for the save/discard pair', () => {
		const deleteOnly = getRowActionsMinWidth(['delete']);
		expect(deleteOnly).toBeGreaterThan(0);
		expect(getRowActionsMinWidth(['update'])).toBeGreaterThan(deleteOnly);
		expect(getRowActionsMinWidth(['create', 'delete'])).toBe(getRowActionsMinWidth(['update']));
	});
});
