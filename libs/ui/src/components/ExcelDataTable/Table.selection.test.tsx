// @vitest-environment jsdom
import { MantineProvider } from '@mantine/core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { ExcelDataTable } from './index';

import type { SelectionMode } from './selectionModel';
import type { SearchData } from './types';


vi.mock('../../i18n', async importOriginal => {
	const translate = (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key;
	return {
		...await importOriginal<object>(),
		useTranslate: () => translate,
		useI18n: () => ({ language: 'en' }),
		useSchemaLocalize: () => (value: unknown) => String(value ?? ''),
	};
});

const ids = ['a', 'b', 'c', 'd'];
const data = {
	items: ids.map(id => ({ id, name: `Name ${id}` })),
	total: ids.length, page: 0, size: 50, desired_fields: ['name'], masked_fields: [],
} as unknown as SearchData;

beforeAll(() => {
	window.matchMedia ??= (query: string) => ({
		matches: false, media: query, onchange: null, addListener: () => undefined, removeListener: () => undefined,
		addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false,
	});
	globalThis.ResizeObserver ??= class {
		observe(): void { /* jsdom lays nothing out */ }
		unobserve(): void { /* jsdom lays nothing out */ }
		disconnect(): void { /* jsdom lays nothing out */ }
	};
});

afterEach(cleanup);

function renderTable(selectionMode?: SelectionMode): void {
	render(
		<MantineProvider env='test'>
			<MemoryRouter>
				<ExcelDataTable.Provider data={data} testId='t.table' selectionMode={selectionMode}>
					<ExcelDataTable.Table />
				</ExcelDataTable.Provider>
			</MemoryRouter>
		</MantineProvider>,
	);
}

const indexCell = (id: string) => screen.getByTestId(`t.table.row.${id}.select`);
const dataCell = (id: string) => screen.getByTestId(`t.table.row.${id}.cell.name`);
const fillerCell = (id: string) => screen.getByTestId(`t.table.row.${id}`).lastElementChild as HTMLElement;

function selectedIds(): string[] {
	return ids.filter(id => screen.getByTestId(`t.table.row.${id}`).getAttribute('aria-selected') === 'true');
}

function pressIndex(id: string, init: PointerEventInit = {}): void {
	fireEvent.pointerDown(indexCell(id), { button: 0, pointerId: 1, ...init });
	fireEvent.pointerUp(document, { button: 0, pointerId: 1 });
}

describe('ExcelDataTable index cell', () => {
	it('adds rows on click and deselects a selected one', () => {
		renderTable();
		pressIndex('a');
		pressIndex('c');
		expect(selectedIds()).toEqual(['a', 'c']);
		pressIndex('a');
		expect(selectedIds()).toEqual(['c']);
	});

	it('adds the range from the anchor on Shift+click', () => {
		renderTable();
		pressIndex('a');
		pressIndex('c', { shiftKey: true });
		expect(selectedIds()).toEqual(['a', 'b', 'c']);
	});

	it('toggles the row on Space', () => {
		renderTable();
		fireEvent.keyDown(indexCell('b'), { key: ' ' });
		expect(selectedIds()).toEqual(['b']);
		fireEvent.keyDown(indexCell('b'), { key: ' ' });
		expect(selectedIds()).toEqual([]);
	});

	it('selects only that row, or none, in single mode', () => {
		renderTable('single');
		pressIndex('a');
		pressIndex('c');
		expect(selectedIds()).toEqual(['c']);
		pressIndex('c');
		expect(selectedIds()).toEqual([]);
	});
});

describe('ExcelDataTable index drag', () => {
	it('selects the range dragged over and shrinks when dragging back', () => {
		renderTable();
		fireEvent.pointerDown(indexCell('a'), { button: 0, pointerId: 1 });
		fireEvent.pointerEnter(indexCell('b'), { pointerId: 1 });
		fireEvent.pointerEnter(indexCell('c'), { pointerId: 1 });
		expect(selectedIds()).toEqual(['a', 'b', 'c']);
		fireEvent.pointerEnter(indexCell('b'), { pointerId: 1 });
		expect(selectedIds()).toEqual(['a', 'b']);
		fireEvent.pointerUp(document, { pointerId: 1 });
		fireEvent.pointerEnter(indexCell('d'), { pointerId: 1 });
		expect(selectedIds()).toEqual(['a', 'b']);
	});

	it('removes the range when the press lands on a selected row', () => {
		renderTable();
		ids.forEach(id => pressIndex(id));
		fireEvent.pointerDown(indexCell('b'), { button: 0, pointerId: 1 });
		fireEvent.pointerEnter(indexCell('c'), { pointerId: 1 });
		fireEvent.pointerUp(document, { pointerId: 1 });
		expect(selectedIds()).toEqual(['a', 'd']);
	});

	it('releases a touch pointer capture so the other cells still see the pointer', () => {
		renderTable();
		const cell = indexCell('a');
		let released = false;
		cell.hasPointerCapture = () => !released;
		cell.releasePointerCapture = () => {
			released = true;
		};
		fireEvent.pointerDown(cell, { button: 0, pointerId: 1, pointerType: 'touch' });
		expect(released).toBe(true);
	});
});

describe('ExcelDataTable data and filler cells', () => {
	it('select exactly that one row and never deselect', () => {
		renderTable();
		pressIndex('a');
		pressIndex('b');
		fireEvent.mouseDown(dataCell('c'), { button: 0 });
		expect(selectedIds()).toEqual(['c']);
		fireEvent.mouseDown(dataCell('c'), { button: 0 });
		expect(selectedIds()).toEqual(['c']);
		fireEvent.mouseDown(fillerCell('d'), { button: 0 });
		expect(selectedIds()).toEqual(['d']);
		fireEvent.mouseDown(fillerCell('d'), { button: 0 });
		expect(selectedIds()).toEqual(['d']);
	});

	it('do not toggle on Ctrl or Meta', () => {
		renderTable();
		fireEvent.mouseDown(dataCell('a'), { button: 0 });
		fireEvent.mouseDown(dataCell('b'), { button: 0, ctrlKey: true });
		fireEvent.mouseDown(dataCell('c'), { button: 0, metaKey: true });
		expect(selectedIds()).toEqual(['a']);
	});

	it('treat Ctrl on the index cell as a plain toggle', () => {
		renderTable();
		pressIndex('a');
		pressIndex('a', { ctrlKey: true });
		expect(selectedIds()).toEqual([]);
	});
});
