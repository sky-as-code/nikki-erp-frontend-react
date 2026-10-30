// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { rowSpanSchemaFromJson } from './rowSpan/rowSpanSchema';
import { makeData, polyfillDom, renderTable, TableHarness, TextEditor } from './tableTestHarness';

import type { HarnessProps } from './tableTestHarness';
import type { ExcelDataTableCapability, NewRowFieldEditor, SearchItem } from './types';


vi.mock('../../i18n', async importOriginal => {
	const translate = (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key;
	return {
		...await importOriginal<object>(),
		useTranslate: () => translate,
		useI18n: () => ({ language: 'en' }),
		useSchemaLocalize: () => (value: unknown) => String(value ?? ''),
	};
});

// A grouped table's row forms use its flat schema; nothing may fetch one by name.
vi.mock('../../hookhoc/useDynamicModel', () => ({ useDynamicModel: () => ({ pack: null, isPending: false }) }));

const bus = vi.hoisted(() => ({ publish: vi.fn(async () => ({ result: {} })) }));
vi.mock('../../microApp/MicroAppProvider', async importOriginal => ({
	...await importOriginal<object>(),
	useCommandBus: () => bus,
}));

beforeAll(polyfillDom);
afterEach(() => {
	cleanup();
	bus.publish.mockClear();
	vi.restoreAllMocks();
});

const groupSchema = rowSpanSchemaFromJson({
	name: 'test_group',
	fields: [
		{ name: 'id', data_type: 'ulid', is_primary_key: true },
		{ name: 'etag', data_type: 'string', is_auto_generated: true },
		{ name: 'template', data_type: 'string' },
		{ name: 'attrs', data_type: 'model', fields: [
			{ name: 'attr', data_type: 'string' },
			{ name: 'value', data_type: 'string' },
		] },
		{ name: 'qty', data_type: 'string' },
	],
});

const FIELDS = ['template', 'attrs', 'qty'];

const groups: SearchItem[] = [
	{ id: 'g1', etag: 'e1', template: 'T1', qty: '2', attrs: [{ attr: 'color', value: 'red' }, { attr: 'size', value: 'L' }] },
	{ id: 'g2', etag: 'e2', template: 'T2', qty: '1', attrs: [] },
];

const editors: Record<string, NewRowFieldEditor> = {
	template: TextEditor, qty: TextEditor, attr: TextEditor, value: TextEditor,
};

const grouped = {
	modelSchema: groupSchema,
	rowSpanField: 'template',
	rowSingleField: 'attrs',
	indexColumnVisible: false,
	fieldEditors: editors,
};

const editable = {
	...grouped,
	updateScope: 'table' as const,
	capabilities: ['create', 'update', 'delete'] as ExcelDataTableCapability[],
	subRowPrompt: 'Add attribute',
	newRowPrompt: 'Add product',
};

/** Keeps nested groups in state, as a form's drafts do; every write is a whole group. */
function GroupHost(props: HarnessProps & { onWrite: (kind: string, values: unknown) => void }): React.ReactNode {
	const { onWrite, ...rest } = props;
	const [items, setItems] = React.useState(groups);
	return (
		<TableHarness
			{...rest}
			capabilities={[...editable.capabilities]}
			data={makeData(items, FIELDS)}
			onCreated={(values) => {
				onWrite('create', values);
				setItems(prev => [...prev, { id: `g${prev.length + 1}`, etag: 'draft', ...values }]);
			}}
			onUpdated={(values) => {
				onWrite('update', values);
				setItems(prev => prev.map(item => (item.id === values.id ? values as SearchItem : item)));
			}}
			onDeleted={(rows) => {
				onWrite('delete', rows);
				setItems(prev => prev.filter(item => !rows.some(row => row.id === item.id)));
			}}
		/>
	);
}

const byId = (id: string) => screen.queryByTestId(`t.table.${id}`);
const input = (id: string) => screen.getByTestId(`t.table.${id}`).querySelector('input') as HTMLInputElement;

describe('ExcelDataTable row span (view mode)', () => {
	it('draws each group field once, spanning the group, and the nested fields per sub-row', () => {
		renderTable({ ...grouped, data: makeData(groups, FIELDS), updateMode: false });
		expect(byId('row.g1:0.cell.template')?.getAttribute('rowspan')).toBe('2');
		expect(byId('row.g1:0.cell.qty')?.getAttribute('rowspan')).toBe('2');
		expect(byId('row.g1:1.cell.template')).toBeNull();
		expect(byId('row.g1:1.cell.value')?.textContent).toBe('L');
		expect(byId('row.g2:-.cell.template')?.textContent).toBe('T2');
		expect(byId('row.g2:-.cell.attr')).toBeNull();
		expect(screen.queryByText('Add attribute')).toBeNull();
		expect(byId('row.g1.delete')).toBeNull();
	});

	it('renders flat, with a warning, when rowSingleField is not a model field', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		renderTable({ ...grouped, rowSingleField: 'qty', data: makeData(groups, FIELDS), updateMode: false });
		expect(byId('row.g1.cell.template')).toBeTruthy();
		expect(warn).toHaveBeenCalledWith(expect.stringMatching(/must be a field of data_type 'model'.*rendering flat/));
	});
});

describe('ExcelDataTable row span (table scope)', () => {
	function renderHost() {
		const onWrite = vi.fn();
		render(<GroupHost {...editable} onWrite={onWrite} />);
		return onWrite;
	}

	it('spans the group over its sub-rows and its sub-row insert line', async () => {
		renderHost();
		await screen.findByTestId('t.table.row.g1:0.input.template');
		expect(byId('row.g1:0.input.template')?.getAttribute('rowspan')).toBe('3');
		expect(byId('row.g2:-.input.template')?.getAttribute('rowspan')).toBe('2');
		expect(byId('row.g1.addSubRow')?.textContent).toContain('Add attribute');
		expect(byId('row.g1:1.deleteSubRow')).toBeTruthy();
		expect(byId('row.g1:1.delete')).toBeNull();
	});

	it('writes an edited sub-row field as the whole re-nested group', async () => {
		const onWrite = renderHost();
		await screen.findByTestId('t.table.row.g1:1.input.value');
		fireEvent.change(input('row.g1:1.input.value'), { target: { value: 'XL' } });
		fireEvent.keyDown(input('row.g1:1.input.value'), { key: 'Enter' });
		await waitFor(() => expect(onWrite).toHaveBeenCalledWith('update', {
			...groups[0], attrs: [{ attr: 'color', value: 'red' }, { attr: 'size', value: 'XL' }],
		}));
	});

	it('deletes one sub-row as a group update, and the group as a delete', async () => {
		const onWrite = renderHost();
		fireEvent.click(await screen.findByTestId('t.table.row.g1:0.deleteSubRow'));
		await waitFor(() => expect(onWrite).toHaveBeenCalledWith('update', { ...groups[0], attrs: [groups[0].attrs[1]] }));
		fireEvent.click(await screen.findByTestId('t.table.row.g1.delete'));
		await waitFor(() => expect(onWrite).toHaveBeenCalledWith('delete', [{ ...groups[0], attrs: [groups[0].attrs[1]] }]));
		await waitFor(() => expect(byId('row.g1:0.input.template')).toBeNull());
	});

	it('adds sub-rows on Enter, opening a fresh line below each, and closes on Escape', async () => {
		const onWrite = renderHost();
		fireEvent.click(await screen.findByTestId('t.table.row.g2.addSubRow'));
		const line = await screen.findByTestId('t.table.row.g2.newSubRow');
		expect(line.querySelectorAll('input')).toHaveLength(2);
		await waitFor(() => expect(document.activeElement).toBe(input('newRow.input.attr')));
		fireEvent.change(input('newRow.input.attr'), { target: { value: 'color' } });
		fireEvent.change(input('newRow.input.value'), { target: { value: 'blue' } });
		fireEvent.keyDown(input('newRow.input.value'), { key: 'Enter' });
		await waitFor(() => expect(onWrite).toHaveBeenCalledWith('update', { ...groups[1], attrs: [{ attr: 'color', value: 'blue' }] }));
		await screen.findByTestId('t.table.row.g2:0.input.attr');
		await waitFor(() => expect(input('newRow.input.attr').value).toBe(''));
		const rows = Array.from(document.querySelectorAll('tbody tr'));
		const added = rows.indexOf(byId('row.g2:0')!);
		expect(rows[added + 1]).toBe(byId('row.g2.newSubRow'));
		expect(byId('row.g2:0.input.template')?.getAttribute('rowspan')).toBe('2');
		fireEvent.keyDown(input('newRow.input.attr'), { key: 'Escape' });
		await waitFor(() => expect(byId('row.g2.newSubRow')).toBeNull());
		expect(byId('row.g2.addSubRow')).toBeTruthy();
	});

	it('renders nested inputs from the flat schema without editors (AutoField, no schema fetch)', async () => {
		render(<GroupHost {...editable} fieldEditors={{ template: TextEditor, qty: TextEditor }} onWrite={vi.fn()} />);
		fireEvent.click(await screen.findByTestId('t.table.row.g1.addSubRow'));
		await screen.findByTestId('t.table.row.g1.newSubRow');
		expect(input('newRow.input.attr')).toBeTruthy();
		expect(input('row.g1:0.input.value').value).toBe('red');
	});

	it('adds a group from the main insert row with its own fields and no sub-row', async () => {
		const onWrite = renderHost();
		fireEvent.click(await screen.findByTestId('t.table.addLine'));
		await screen.findByTestId('t.table.newRow.input.template');
		expect(byId('newRow.input.attr')).toBeNull();
		fireEvent.change(input('newRow.input.template'), { target: { value: 'T3' } });
		fireEvent.change(input('newRow.input.qty'), { target: { value: '4' } });
		fireEvent.keyDown(input('newRow.input.qty'), { key: 'Enter' });
		await waitFor(() => expect(onWrite).toHaveBeenCalledWith('create', { template: 'T3', qty: '4', attrs: [] }));
		await screen.findByTestId('t.table.row.g3:-.input.template');
		expect(byId('row.g3.addSubRow')).toBeTruthy();
	});
});
