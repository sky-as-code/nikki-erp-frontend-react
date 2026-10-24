// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { polyfillDom, renderTable, SelectEditor, StatefulHost, textEditors } from './tableTestHarness';

import type { NewRowFieldEditor } from './types';


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

const cellInput = (rowId: string, field: string) => (
	screen.getByTestId(`t.table.row.${rowId}.input.${field}`).querySelector('input') as HTMLInputElement
);

async function rowsReady(): Promise<void> {
	await screen.findByTestId('t.table.row.a.input.name');
}

const tableScope = { updateScope: 'table' as const, capabilities: ['update', 'delete'] as const };

describe('ExcelDataTable updateScope=table', () => {
	it('renders every row editor at once, with no Save, and Delete always shown', async () => {
		renderTable({ ...tableScope, capabilities: ['update', 'delete'], onUpdated: vi.fn(), onDeleted: vi.fn(), fieldEditors: textEditors });
		await rowsReady();
		expect(['a', 'b', 'c'].map(id => cellInput(id, 'name').value)).toEqual(['Alpha', 'Bravo', 'Charlie']);
		expect(screen.queryByTestId('t.table.row.a.save')).toBeNull();
		expect(screen.queryByTestId('t.table.row.a.edit')).toBeNull();
		expect(screen.getByTestId('t.table.row.b.delete')).toBeTruthy();
	});

	it('writes typed text once focus leaves its cell, and never the same value twice', async () => {
		const onUpdated = vi.fn();
		renderTable({ ...tableScope, capabilities: ['update'], onUpdated, fieldEditors: textEditors });
		await rowsReady();
		const input = cellInput('a', 'name');
		input.focus();
		fireEvent.change(input, { target: { value: 'Alpha 2' } });
		expect(onUpdated).not.toHaveBeenCalled();
		fireEvent.blur(input, { relatedTarget: cellInput('b', 'name') });
		await waitFor(() => expect(onUpdated).toHaveBeenCalledWith({ id: 'a', etag: 'ea', name: 'Alpha 2' }));
		fireEvent.blur(input, { relatedTarget: null });
		await new Promise(resolve => setTimeout(resolve, 20));
		expect(onUpdated).toHaveBeenCalledTimes(1);
	});

	it('writes on Enter in a text input', async () => {
		const onUpdated = vi.fn();
		renderTable({ ...tableScope, capabilities: ['update'], onUpdated, fieldEditors: textEditors });
		await rowsReady();
		fireEvent.change(cellInput('b', 'kind'), { target: { value: 'w' } });
		fireEvent.keyDown(cellInput('b', 'kind'), { key: 'Enter' });
		await waitFor(() => expect(onUpdated).toHaveBeenCalledWith({ id: 'b', etag: 'eb', kind: 'w' }));
	});

	it('writes a picked option at once', async () => {
		const onUpdated = vi.fn();
		const editors: Record<string, NewRowFieldEditor> = { name: textEditors.name, kind: SelectEditor };
		renderTable({ ...tableScope, capabilities: ['update'], onUpdated, fieldEditors: editors });
		await rowsReady();
		fireEvent.click(cellInput('c', 'kind'));
		fireEvent.click(await screen.findByRole('option', { name: 'z' }));
		await waitFor(() => expect(onUpdated).toHaveBeenCalledWith({ id: 'c', etag: 'ec', kind: 'z' }));
	});

	it('puts the focused field back on Escape', async () => {
		const onUpdated = vi.fn();
		renderTable({ ...tableScope, capabilities: ['update'], onUpdated, fieldEditors: textEditors });
		await rowsReady();
		fireEvent.change(cellInput('a', 'name'), { target: { value: 'Oops' } });
		fireEvent.keyDown(cellInput('a', 'name'), { key: 'Escape' });
		await waitFor(() => expect(cellInput('a', 'name').value).toBe('Alpha'));
		expect(onUpdated).not.toHaveBeenCalled();
	});

});

describe('ExcelDataTable updateScope=table writes and modes', () => {
	it('publishes updateCommand and refreshes after a command write', async () => {
		const onRefresh = vi.fn();
		renderTable({ ...tableScope, capabilities: ['update'], updateCommand: 'lines.update', onRefresh, fieldEditors: textEditors });
		await rowsReady();
		fireEvent.change(cellInput('a', 'kind'), { target: { value: 'q' } });
		fireEvent.blur(cellInput('a', 'kind'));
		await waitFor(() => expect(bus.publish).toHaveBeenCalledWith({
			name: 'lines.update', payload: { id: 'a', etag: 'ea', kind: 'q' },
		}));
		await waitFor(() => expect(onRefresh).toHaveBeenCalled());
	});

	it('opens no row editor on double-click', async () => {
		renderTable({ ...tableScope, capabilities: ['update'], onUpdated: vi.fn(), fieldEditors: textEditors });
		await rowsReady();
		fireEvent.doubleClick(screen.getByTestId('t.table.row.a.select'));
		expect(screen.queryByTestId('t.table.row.a.save')).toBeNull();
	});

	it('is read-only out of update mode', () => {
		renderTable({ ...tableScope, capabilities: ['update', 'delete'], updateMode: false, onUpdated: vi.fn(), onDeleted: vi.fn() });
		expect(screen.getByTestId('t.table.row.a.cell.name').textContent).toBe('Alpha');
		expect(screen.queryByTestId('t.table.row.a.input.name')).toBeNull();
		expect(screen.queryByTestId('t.table.row.a.delete')).toBeNull();
	});

	it('deletes a row through onDeleted', async () => {
		const writes: Array<[string, unknown]> = [];
		render(<StatefulHost {...tableScope} capabilities={['update', 'delete']} fieldEditors={textEditors} onWrite={(kind, v) => writes.push([kind, v])} />);
		await rowsReady();
		fireEvent.click(screen.getByTestId('t.table.row.b.delete'));
		await waitFor(() => expect(screen.queryByTestId('t.table.row.b')).toBeNull());
		expect(writes[0][0]).toBe('delete');
	});

	it('turns an added line into an ordinary editable row', async () => {
		render(<StatefulHost {...tableScope} capabilities={['update', 'create']} fieldEditors={textEditors} />);
		await rowsReady();
		fireEvent.click(screen.getByTestId('t.table.addLine'));
		const newName = await screen.findByTestId('t.table.newRow.input.name');
		const input = newName.querySelector('input') as HTMLInputElement;
		fireEvent.change(input, { target: { value: 'Delta' } });
		fireEvent.keyDown(input, { key: 'Enter' });
		await waitFor(() => expect(cellInput('new1', 'name').value).toBe('Delta'));
		await waitFor(() => expect(document.activeElement).toBe(
			screen.getByTestId('t.table.newRow.input.name').querySelector('input'),
		));
	});
});
