// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { measureSortedRow } from './manualSort/ManualSort';
import { polyfillDom, renderTable, StatefulHost, TableHarness, textEditors } from './tableTestHarness';
import { EntitlementProvider } from '../PermissionGuard/entitlementContext';

import type { ActionColumn } from './types';


vi.mock('../../i18n', async importOriginal => {
	const translate = (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key;
	return {
		...await importOriginal<object>(),
		useTranslate: () => translate,
		useI18n: () => ({ language: 'en' }),
		useSchemaLocalize: () => (value: unknown) => String(value ?? ''),
	};
});

vi.mock('../../hookhoc/useDynamicModel', async () => {
	const { z } = await import('zod');
	const { testSchema } = await import('./tableTestSchema');
	const state = { pack: { modelSchema: testSchema, validationSchema: z.looseObject({}) }, isPending: false };
	return { useDynamicModel: () => state };
});

const bus = vi.hoisted(() => ({ publish: vi.fn(async () => ({ result: {} })) }));
vi.mock('../../microApp/MicroAppProvider', async importOriginal => ({
	...await importOriginal<object>(),
	useCommandBus: () => bus,
}));

beforeAll(polyfillDom);
afterEach(() => {
	cleanup();
	bus.publish.mockClear();
});

const handle = (rowId: string) => screen.getByTestId(`t.table.row.${rowId}.sortHandle`);

function selectedIds(): string[] {
	return ['a', 'b', 'c'].filter(id => screen.getByTestId(`t.table.row.${id}`).getAttribute('aria-selected') === 'true');
}

function colCounts(): number[] {
	return Array.from(document.querySelectorAll('colgroup')).map(group => group.children.length);
}

function pressIndex(rowId: string): void {
	fireEvent.pointerDown(screen.getByTestId(`t.table.row.${rowId}.select`), { button: 0, pointerId: 1 });
	fireEvent.pointerUp(document, { pointerId: 1 });
}

describe('ExcelDataTable manual sort', () => {
	const onManualSort = vi.fn();
	const sortable = { enableManualSort: true, onManualSort, capabilities: ['update' as const], onUpdated: vi.fn() };

	it('puts a handle column right after the index column, in the header and the body alike', () => {
		renderTable(sortable);
		const cells = screen.getByTestId('t.table.row.a').children;
		expect(cells[0].getAttribute('data-testid')).toBe('t.table.row.a.select');
		expect(cells[1].contains(handle('a'))).toBe(true);
		const [header, body] = colCounts();
		expect(header).toBe(body);
		expect(body).toBe(5);
	});

	it('locks the handle, with the reason, when the table cannot update', () => {
		renderTable({ enableManualSort: true, onManualSort });
		expect(handle('a').getAttribute('data-disabled')).toBe('true');
		expect(handle('a').getAttribute('aria-label')).toBe('Rows can be reordered only in edit mode');
	});

	it('locks the handle while the insert row is open', async () => {
		renderTable({ ...sortable, capabilities: ['update', 'create'], onCreated: vi.fn(), fieldEditors: textEditors });
		expect(handle('a').getAttribute('data-disabled')).toBeNull();
		fireEvent.click(screen.getByTestId('t.table.addLine'));
		await screen.findByTestId('t.table.newRow');
		expect(handle('a').getAttribute('aria-label')).toBe('Finish the row being edited first');
	});

	it('clears and freezes the selection when a drag starts, showing a placeholder row', async () => {
		renderTable(sortable);
		pressIndex('a');
		expect(selectedIds()).toEqual(['a']);
		const grip = handle('b');
		grip.focus();
		fireEvent.keyDown(grip, { key: ' ', code: 'Space' });
		await screen.findByTestId('t.table.sortPlaceholder');
		expect(selectedIds()).toEqual([]);
		pressIndex('c');
		expect(selectedIds()).toEqual([]);
		// The keyboard sensor listens for its move and end keys from the next tick on.
		await act(() => new Promise(resolve => setTimeout(resolve, 0)));
		fireEvent.keyDown(grip, { key: 'Escape', code: 'Escape' });
		await waitFor(() => expect(screen.queryByTestId('t.table.sortPlaceholder')).toBeNull());
		expect(onManualSort).not.toHaveBeenCalled();
	});

	it('reports the new order on a drop, and writes nothing itself', async () => {
		const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(rowRect);
		const onUpdated = vi.fn();
		renderTable({ ...sortable, onUpdated });
		const grip = handle('a');
		grip.focus();
		fireEvent.keyDown(grip, { key: ' ', code: 'Space' });
		await screen.findByTestId('t.table.sortPlaceholder');
		await act(() => new Promise(resolve => setTimeout(resolve, 0)));
		fireEvent.keyDown(grip, { key: 'ArrowDown', code: 'ArrowDown' });
		await act(() => new Promise(resolve => setTimeout(resolve, 0)));
		fireEvent.keyDown(grip, { key: ' ', code: 'Space' });
		await waitFor(() => expect(onManualSort).toHaveBeenCalledWith(['b', 'a', 'c']));
		expect(onUpdated).not.toHaveBeenCalled();
		rect.mockRestore();
	});
});

describe('ExcelDataTable manual sort preview', () => {
	const sortable = { enableManualSort: true, onManualSort: vi.fn(), capabilities: ['update' as const], onUpdated: vi.fn() };

	it('renders the drag preview outside the table, so no transformed ancestor can offset it', async () => {
		const view = renderTable(sortable);
		const grip = handle('b');
		grip.focus();
		fireEvent.keyDown(grip, { key: ' ', code: 'Space' });
		await screen.findByTestId('t.table.sortPlaceholder');
		const preview = await waitFor(() => {
			const found = document.querySelector('[class*="sortDragOverlay"]');
			expect(found).not.toBeNull();
			return found as HTMLElement;
		});
		expect(view.container.contains(preview)).toBe(false);
		expect(document.body.contains(preview)).toBe(true);
		await act(() => new Promise(resolve => setTimeout(resolve, 0)));
		fireEvent.keyDown(grip, { key: 'Escape', code: 'Escape' });
	});

	it('measures a hidden dragged row by the placeholder holding its slot', () => {
		const body = document.createElement('tbody');
		body.innerHTML = '<tr data-sort-placeholder></tr><tr hidden></tr><tr></tr>';
		const [placeholder, row, other] = Array.from(body.children) as HTMLElement[];
		const box = (top: number) => () => ({
			x: 0, y: top, top, left: 10, width: 600, height: 30, bottom: top + 30, right: 610, toJSON: () => ({}),
		});
		placeholder.getBoundingClientRect = box(90);
		row.getBoundingClientRect = box(0);
		other.getBoundingClientRect = box(120);
		expect(measureSortedRow(row)).toMatchObject({ top: 90, left: 10, height: 30 });
		expect(measureSortedRow(other)).toMatchObject({ top: 120 });
	});
});

/** Lays the body rows out 30px apart, so the keyboard drag has somewhere to move to. */
function rowRect(this: HTMLElement): DOMRect {
	const rowId = /^t\.table\.row\.(\w)$/.exec(this.getAttribute('data-testid') ?? '')?.[1];
	const top = rowId ? ['a', 'b', 'c'].indexOf(rowId) * 30 : 0;
	return { x: 0, y: top, top, left: 0, width: 600, height: 30, bottom: top + 30, right: 600, toJSON: () => ({}) };
}

const moreColumn: ActionColumn = {
	key: 'more',
	label: 'More',
	afterField: 'name',
	actions: [
		{ key: 'run', label: 'Run', type: 'action', command: 'lines.run' },
		{ key: 'open', label: 'Open', type: 'action_link', href: row => `/lines/${row.id}` },
		{
			key: 'see', label: 'See', type: 'link', href: row => `/see/${row.id}`,
			disabled: row => (row.id === 'b' ? 'Save first' : false),
		},
	],
};

describe('ExcelDataTable action columns', () => {
	it('places a column after its afterField, label in the header, aligned with the body', () => {
		renderTable({ actionColumns: [moreColumn, { key: 'tail', actions: [] }] });
		const header = screen.getByTestId('t.table.actionColumn.more');
		expect(header.textContent).toBe('More');
		expect(header.previousElementSibling?.getAttribute('data-testid')).toBe('t.table.sort.name');
		expect(screen.getByTestId('t.table.actionColumn.tail').previousElementSibling?.getAttribute('data-testid'))
			.toBe('t.table.sort.kind');
		const [head, body] = colCounts();
		expect(head).toBe(body);
	});

	it('publishes an action command with the row as payload', async () => {
		renderTable({ actionColumns: [moreColumn] });
		fireEvent.click(screen.getByTestId('t.table.row.a.action.more.run'));
		await waitFor(() => expect(bus.publish).toHaveBeenCalledWith({
			name: 'lines.run', payload: { id: 'a', etag: 'ea', name: 'Alpha', kind: 'x' },
		}));
	});

	it('links to href(row), and disables an action with its reason', () => {
		renderTable({ actionColumns: [moreColumn] });
		expect(screen.getByTestId('t.table.row.a.action.more.open').getAttribute('href')).toBe('/lines/a');
		expect(screen.getByTestId('t.table.row.a.action.more.see').getAttribute('href')).toBe('/see/a');
		const disabled = screen.getByTestId('t.table.row.b.action.more.see');
		expect(disabled.getAttribute('href')).toBeNull();
		expect(disabled.getAttribute('aria-disabled')).toBe('true');
	});

	it('locks, never hides, an action whose entitlement the caller lacks', () => {
		const locked: ActionColumn = {
			...moreColumn, actions: [{ ...moreColumn.actions[0], entitlement: 'run:test_line:tenant' }],
		};
		render(
			<EntitlementProvider value={{ context: { entitlements: [], userOrgIds: [] } }}>
				<TableHarness actionColumns={[locked]} />
			</EntitlementProvider>,
		);
		const button = screen.getByTestId('t.table.row.a.action.more.run');
		expect(button.getAttribute('data-locked')).toBe('true');
		fireEvent.click(button);
		expect(bus.publish).not.toHaveBeenCalled();
	});
});

describe('ExcelDataTable change indicator', () => {
	it('marks the rows the table created and updated', async () => {
		render(<StatefulHost capabilities={['create', 'update']} enableChangeIndicator fieldEditors={textEditors} />);
		fireEvent.doubleClick(screen.getByTestId('t.table.row.a.cell.name'));
		const input = (await screen.findByTestId('t.table.row.a.input.name')).querySelector('input') as HTMLInputElement;
		fireEvent.change(input, { target: { value: 'Alpha 2' } });
		fireEvent.keyDown(input, { key: 'Enter' });
		expect((await screen.findByTestId('t.table.row.a.change')).textContent).toBe('Changed');
		fireEvent.click(screen.getByTestId('t.table.addLine'));
		const newName = (await screen.findByTestId('t.table.newRow.input.name')).querySelector('input') as HTMLInputElement;
		fireEvent.change(newName, { target: { value: 'Delta' } });
		fireEvent.keyDown(newName, { key: 'Enter' });
		expect((await screen.findByTestId('t.table.row.new1.change')).textContent).toBe('New');
		expect(screen.queryByTestId('t.table.row.b.change')).toBeNull();
	});

	it('shows the host marks, in the first data cell when the index column is hidden', () => {
		renderTable({ enableChangeIndicator: true, indexColumnVisible: false, isNewRow: row => row.id === 'c' });
		const badge = screen.getByTestId('t.table.row.c.change');
		expect(screen.getByTestId('t.table.row.c.cell.name').contains(badge)).toBe(true);
	});

	it('shows nothing when the indicator is off', () => {
		renderTable({ isNewRow: () => true });
		expect(screen.queryByTestId('t.table.row.a.change')).toBeNull();
	});
});
