import { MantineProvider, MultiSelect, Select } from '@mantine/core';
import { render } from '@testing-library/react';
import React from 'react';
import { Controller } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';

import { ExcelDataTable } from './index';
import { testSchema } from './tableTestSchema';

import type { ExcelDataTableProviderProps } from './Provider';
import type { NewRowFieldEditor, SearchData, SearchItem } from './types';


/**
 * Shared by the component tests of the table's row features. Each test file mocks
 * `useDynamicModel` (so a row form gets `testSchema`), `useCommandBus` and the i18n hooks.
 */
export function makeData(items: SearchItem[], fields: string[] = ['name', 'kind']): SearchData {
	return {
		items, total: items.length, page: 0, size: 50, desired_fields: fields, masked_fields: [],
	} as unknown as SearchData;
}

export const sampleItems: SearchItem[] = [
	{ id: 'a', etag: 'ea', name: 'Alpha', kind: 'x' },
	{ id: 'b', etag: 'eb', name: 'Bravo', kind: 'y' },
	{ id: 'c', etag: 'ec', name: 'Charlie', kind: 'x' },
];

/** A plain text input bound to the row form. */
export const TextEditor: NewRowFieldEditor = ({ field, form }) => (
	<input aria-label={field} {...form.form.register(field)} />
);

/** A Mantine `Select` bound to the row form, to exercise Enter inside an open dropdown. */
export const SelectEditor: NewRowFieldEditor = ({ field, form }) => (
	<Controller
		control={form.form.control}
		name={field}
		render={({ field: control }) => (
			<Select
				aria-label={field}
				data={['x', 'y', 'z']}
				value={(control.value as string | undefined) ?? null}
				onChange={value => control.onChange(value)}
				comboboxProps={{ withinPortal: false }}
			/>
		)}
	/>
);

/** A Mantine `MultiSelect` bound to the row form. */
export const MultiSelectEditor: NewRowFieldEditor = ({ field, form }) => (
	<Controller
		control={form.form.control}
		name={field}
		render={({ field: control }) => (
			<MultiSelect
				aria-label={field}
				data={['x', 'y', 'z']}
				value={(control.value as string[] | undefined) ?? []}
				onChange={value => control.onChange(value)}
				comboboxProps={{ withinPortal: false }}
			/>
		)}
	/>
);

export const textEditors: Record<string, NewRowFieldEditor> = { name: TextEditor, kind: TextEditor };

export function polyfillDom(): void {
	window.matchMedia ??= (query: string) => ({
		matches: false, media: query, onchange: null, addListener: () => undefined, removeListener: () => undefined,
		addEventListener: () => undefined, removeEventListener: () => undefined, dispatchEvent: () => false,
	});
	globalThis.ResizeObserver ??= class {
		observe(): void { /* jsdom lays nothing out */ }
		unobserve(): void { /* jsdom lays nothing out */ }
		disconnect(): void { /* jsdom lays nothing out */ }
	};
	Element.prototype.scrollIntoView ??= () => undefined;
}

export type HarnessProps = Omit<ExcelDataTableProviderProps, 'data'> & { data?: SearchData };

export function TableHarness({ data, ...props }: HarnessProps): React.ReactNode {
	return (
		<MantineProvider env='test'>
			<MemoryRouter>
				<ExcelDataTable.Provider
					testId='t.table'
					modelSchema={testSchema}
					data={data ?? makeData(sampleItems)}
					{...props}
				>
					<ExcelDataTable.TableHeader />
					<ExcelDataTable.Table />
				</ExcelDataTable.Provider>
			</MemoryRouter>
		</MantineProvider>
	);
}

export function renderTable(props: HarnessProps = {}) {
	return render(<TableHarness {...props} />);
}

/**
 * A host keeping its rows in state, as a form's drafts do: creates append, updates merge, deletes
 * drop. `onChange` sees every write.
 */
export function StatefulHost(props: HarnessProps & {
	initialItems?: SearchItem[],
	onWrite?: (kind: 'create' | 'update' | 'delete', values: unknown) => void,
}): React.ReactNode {
	const { initialItems = sampleItems, onWrite, ...rest } = props;
	const [items, setItems] = React.useState(initialItems);
	const counter = React.useRef(0);
	const onCreated = (values: Record<string, unknown>) => {
		onWrite?.('create', values);
		counter.current += 1;
		setItems(prev => [...prev, { id: `new${counter.current}`, etag: 'draft', ...values }]);
	};
	const onUpdated = (values: Record<string, unknown>) => {
		onWrite?.('update', values);
		setItems(prev => prev.map(item => (item.id === values.id ? { ...item, ...values } : item)));
	};
	const onDeleted = (rows: SearchItem[]) => {
		onWrite?.('delete', rows);
		setItems(prev => prev.filter(item => !rows.some(row => row.id === item.id)));
	};
	return (
		<TableHarness
			onCreated={onCreated}
			onUpdated={onUpdated}
			onDeleted={onDeleted}
			{...rest}
			data={makeData(items, rest.data?.desired_fields)}
		/>
	);
}
