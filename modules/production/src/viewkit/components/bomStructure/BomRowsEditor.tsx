import { ActionIcon, Alert, Group, Stack, Table } from '@mantine/core';
import { testAttrs } from '@nikkierp/common/utils';
import { Button, Input, LocalizedNumberInput, Modal, Select } from '@nikkierp/ui/components';
import { useTranslate } from '@nikkierp/ui/i18n';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import React from 'react';

import { PRODUCTION_MODULE } from '../../../constants';

import type { ColumnSpec, Option, Row } from './bomStructureData';


const TEST_ID = `${PRODUCTION_MODULE}.bomStructure.editor`;

export type BomRowsEditorProps = {
	title: string,
	columns: ColumnSpec[],
	rows: Row[],
	options: Record<string, Option[]>,
	saving: boolean,
	error?: string,
	onSave: (rows: Row[]) => void,
	onClose: () => void,
};

/**
 * Edits a version's lines or operations as a whole, like the product template's attribute configuration:
 * rows are added, changed and removed here, and only Save sends the difference.
 */
export function BomRowsEditor(props: BomRowsEditorProps): React.ReactNode {
	const t = useTranslate([PRODUCTION_MODULE, 'common']);
	const [rows, setRows] = React.useState<Row[]>(() => props.rows.map(row => ({ ...row })));
	const nextKey = React.useRef(0);
	const update = (index: number, field: string, value: unknown) => setRows(previous => previous.map(
		(row, at) => (at === index ? { ...row, [field]: value } : row)));
	const add = () => setRows(previous => [...previous, { _key: `new-${nextKey.current++}` }]);
	return (
		<Modal opened onClose={props.onClose} title={props.title} centered size='xl'>
			<Stack gap='sm' {...testAttrs(TEST_ID)}>
				{props.error ? <Alert color='red'>{props.error}</Alert> : null}
				<Table withTableBorder verticalSpacing={4}>
					<Table.Thead>
						<Table.Tr>
							{props.columns.map(column => <Table.Th key={column.field}>{t(`fields.${column.field}`)}</Table.Th>)}
							<Table.Th aria-label={t('common:action.delete', { defaultValue: 'Delete' })} />
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{rows.map((row, index) => (
							<Table.Tr key={String(row.id ?? row._key)}>
								{props.columns.map(column => (
									<Table.Td key={column.field}>
										<CellInput
											column={column} value={row[column.field]}
											options={props.options[column.field] ?? []}
											onChange={value => update(index, column.field, value)}
										/>
									</Table.Td>
								))}
								<Table.Td>
									<ActionIcon
										variant='subtle' color='red' onClick={() => setRows(previous => previous.filter((_, at) => at !== index))}
										aria-label={t('common:action.delete', { defaultValue: 'Delete' })} {...testAttrs(TEST_ID, 'remove')}
									>
										<IconTrash size={16} />
									</ActionIcon>
								</Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
				<Group justify='space-between'>
					<Button variant='subtle' leftSection={<IconPlus size={16} />} onClick={add} {...testAttrs(TEST_ID, 'add')}>
						{t('bom_structure.add_row', { defaultValue: 'Add a row' })}
					</Button>
					<Group gap='xs'>
						<Button color='gray' onClick={props.onClose}>{t('common:action.close', { defaultValue: 'Close' })}</Button>
						<Button loading={props.saving} onClick={() => props.onSave(rows)} {...testAttrs(TEST_ID, 'save')}>
							{t('common:action.save', { defaultValue: 'Save' })}
						</Button>
					</Group>
				</Group>
			</Stack>
		</Modal>
	);
}

type CellInputProps = { column: ColumnSpec, value: unknown, options: Option[], onChange: (value: unknown) => void };

function CellInput({ column, value, options, onChange }: CellInputProps): React.ReactNode {
	if (column.kind === 'relation') {
		return (
			<Select
				searchable clearable={!column.required} data={options} value={(value as string | undefined) ?? null}
				onChange={next => onChange(next ?? null)} {...testAttrs(TEST_ID, 'field', column.field)}
			/>
		);
	}
	if (column.kind === 'number') {
		return (
			<LocalizedNumberInput
				value={value === null || value === undefined ? '' : Number(value)} onChange={next => onChange(next)}
				{...testAttrs(TEST_ID, 'field', column.field)}
			/>
		);
	}
	return (
		<Input
			value={String(value ?? '')} onChange={event => onChange(event.currentTarget.value)}
			{...testAttrs(TEST_ID, 'field', column.field)}
		/>
	);
}
