// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import {
	makeData, MultiSelectEditor, polyfillDom, renderTable, SelectEditor, StatefulHost, TableHarness, textEditors,
} from './tableTestHarness';

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
afterEach(cleanup);

const nameInput = () => screen.getByTestId('t.table.newRow.input.name').querySelector('input') as HTMLInputElement;

async function openInsertRow(): Promise<void> {
	fireEvent.click(screen.getByTestId('t.table.addLine'));
	await screen.findByTestId('t.table.newRow');
}

const kindInput = () => screen.getByTestId('t.table.newRow.input.kind').querySelector('input') as HTMLInputElement;

async function openDropdown(): Promise<HTMLInputElement> {
	const select = kindInput();
	fireEvent.click(select);
	await waitFor(() => expect(select.getAttribute('data-expanded')).toBe('true'));
	return select;
}

/** Mantine marks the option under keyboard focus `data-combobox-selected`; Enter then picks it. */
async function highlightFirstOption(select: HTMLInputElement): Promise<void> {
	fireEvent.keyDown(select, { key: 'ArrowDown', code: 'ArrowDown' });
	await waitFor(() => expect(document.querySelector('[data-combobox-selected]')).not.toBeNull());
}

describe('ExcelDataTable insert row', () => {
	it('focuses its first input when it opens', async () => {
		renderTable({ capabilities: ['create'], onCreated: () => undefined, fieldEditors: textEditors });
		await openInsertRow();
		await waitFor(() => expect(document.activeElement).toBe(nameInput()));
	});

	it('adds on Enter, then opens a fresh insert row with its first input focused', async () => {
		const writes: unknown[] = [];
		render(<StatefulHost capabilities={['create']} fieldEditors={textEditors} onWrite={(_, v) => writes.push(v)} />);
		await openInsertRow();
		fireEvent.change(nameInput(), { target: { value: 'Delta' } });
		fireEvent.keyDown(nameInput(), { key: 'Enter' });
		await waitFor(() => expect(writes).toEqual([{ name: 'Delta', kind: '' }]));
		await screen.findByText('Delta');
		await waitFor(() => expect(document.activeElement).toBe(nameInput()));
		expect(nameInput().value).toBe('');
	});

	it('waits for a load to finish before focusing the row a successful Add opened', async () => {
		const view = render(<LoadingAfterAddHost />);
		await openInsertRow();
		fireEvent.change(nameInput(), { target: { value: 'Delta' } });
		fireEvent.keyDown(nameInput(), { key: 'Enter' });
		await screen.findByText('Delta');
		expect(document.activeElement).not.toBe(nameInput());
		await act(async () => view.rerender(<LoadingAfterAddHost loaded />));
		await waitFor(() => expect(document.activeElement).toBe(nameInput()));
	});

});

describe('ExcelDataTable insert row, Enter in a dropdown', () => {
	it.each([
		['Select', SelectEditor],
		['MultiSelect', MultiSelectEditor],
	])('leaves Enter to the highlighted option of an open %s dropdown instead of adding', async (_, editor) => {
		const onCreated = vi.fn();
		const editors: Record<string, NewRowFieldEditor> = { name: textEditors.name, kind: editor };
		renderTable({ capabilities: ['create'], onCreated, fieldEditors: editors });
		await openInsertRow();
		const select = await openDropdown();
		await highlightFirstOption(select);
		fireEvent.keyDown(select, { key: 'Enter', code: 'Enter' });
		expect(onCreated).not.toHaveBeenCalled();
	});

	it.each([
		['Select', SelectEditor],
		['MultiSelect', MultiSelectEditor],
	])('adds on Enter in an open %s dropdown with no option highlighted', async (_, editor) => {
		const onCreated = vi.fn();
		const editors: Record<string, NewRowFieldEditor> = { name: textEditors.name, kind: editor };
		renderTable({ capabilities: ['create'], onCreated, fieldEditors: editors });
		await openInsertRow();
		fireEvent.change(nameInput(), { target: { value: 'Delta' } });
		const select = await openDropdown();
		expect(document.querySelector('[data-combobox-selected]')).toBeNull();
		fireEvent.keyDown(select, { key: 'Enter', code: 'Enter' });
		await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1));
	});

	it('adds on Enter after a MultiSelect pick, whose dropdown stays open', async () => {
		const onCreated = vi.fn();
		const editors: Record<string, NewRowFieldEditor> = { name: textEditors.name, kind: MultiSelectEditor };
		renderTable({ capabilities: ['create'], onCreated, fieldEditors: editors });
		await openInsertRow();
		fireEvent.change(nameInput(), { target: { value: 'Delta' } });
		const select = await openDropdown();
		fireEvent.click(screen.getByRole('option', { name: 'y' }));
		expect(select.getAttribute('data-expanded')).toBe('true');
		fireEvent.keyDown(select, { key: 'Enter', code: 'Enter' });
		await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1));
		expect(onCreated.mock.calls[0][0]).toMatchObject({ name: 'Delta', kind: ['y'] });
	});

	it('picks the highlighted Select option on Enter, then adds on the next Enter', async () => {
		const onCreated = vi.fn();
		const editors: Record<string, NewRowFieldEditor> = { name: textEditors.name, kind: SelectEditor };
		renderTable({ capabilities: ['create'], onCreated, fieldEditors: editors });
		await openInsertRow();
		fireEvent.change(nameInput(), { target: { value: 'Delta' } });
		const select = await openDropdown();
		await highlightFirstOption(select);
		fireEvent.keyDown(select, { key: 'Enter', code: 'Enter' });
		await waitFor(() => expect(select.value).toBe('x'));
		expect(onCreated).not.toHaveBeenCalled();
		fireEvent.keyDown(select, { key: 'Enter', code: 'Enter' });
		await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1));
		expect(onCreated.mock.calls[0][0]).toMatchObject({ name: 'Delta', kind: 'x' });
	});

	it.each([
		['Select', SelectEditor],
		['MultiSelect', MultiSelectEditor],
	])('adds on Enter in a closed %s, which would otherwise take the key to open itself', async (_, editor) => {
		const onCreated = vi.fn();
		const editors: Record<string, NewRowFieldEditor> = { name: textEditors.name, kind: editor };
		renderTable({ capabilities: ['create'], onCreated, fieldEditors: editors });
		await openInsertRow();
		fireEvent.change(nameInput(), { target: { value: 'Delta' } });
		const select = screen.getByTestId('t.table.newRow.input.kind').querySelector('input') as HTMLInputElement;
		expect(select.getAttribute('aria-expanded')).not.toBe('true');
		fireEvent.keyDown(select, { key: 'Enter', code: 'Enter' });
		await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1));
		expect(select.getAttribute('aria-expanded')).not.toBe('true');
	});

});

describe('ExcelDataTable insert row, Escape in a dropdown', () => {
	it('closes an open dropdown on Escape without discarding the row', async () => {
		const editors: Record<string, NewRowFieldEditor> = { name: textEditors.name, kind: SelectEditor };
		renderTable({ capabilities: ['create'], onCreated: () => undefined, fieldEditors: editors });
		await openInsertRow();
		const select = screen.getByTestId('t.table.newRow.input.kind').querySelector('input') as HTMLInputElement;
		fireEvent.click(select);
		await waitFor(() => expect(select.getAttribute('aria-expanded')).toBe('true'));
		fireEvent.keyDown(select, { key: 'Escape' });
		expect(screen.getByTestId('t.table.newRow')).toBeTruthy();
	});
});

/** Every add triggers a refresh that stays loading until the test says it finished. */
function LoadingAfterAddHost({ loaded = false }: { loaded?: boolean }): React.ReactNode {
	const [items, setItems] = React.useState<Array<Record<string, unknown>>>([]);
	const [loading, setLoading] = React.useState(false);
	React.useEffect(() => {
		if (loaded) {
			setLoading(false);
		}
	}, [loaded]);
	return (
		<TableHarness
			data={makeData(items)}
			isLoading={loading}
			capabilities={['create']}
			fieldEditors={textEditors}
			onCreated={values => setItems(prev => [...prev, { id: 'n1', etag: 'draft', ...values }])}
			onRefresh={() => setLoading(true)}
		/>
	);
}
