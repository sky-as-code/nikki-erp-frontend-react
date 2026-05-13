import { Checkbox, Table } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamic_model';
import clsx from 'clsx';
import React from 'react';

import classes from './DataTable.module.css';
import { applyCustomRenderer, type FieldRendererMap } from './fieldRenderers';
import { TranslateFn, useTranslate } from '../../i18n';


type TableItem = Record<string, unknown>;

type SettingsTableData = Pick<
	dyn.RestSearchResponse<TableItem>,
	'desired_fields' | 'items' | 'masked_fields'
>;

type RowMoveState = { draggingIndex: number | null, dropIndex: number | null };

export type SettingsTableProps = {
	data: SettingsTableData,
	valueKey?: string,
	allowRowMovement?: boolean,
	translateFieldName?: (field: string) => string,
	translationNs?: string,
	fieldRenderer?: FieldRendererMap,
	initialSelectedValues?: string[],
	selectionGetterRef?: React.RefObject<(() => string[]) | null>,
};

export function SettingsTable(props: SettingsTableProps): React.ReactNode {
	const valueKey = props.valueKey ?? 'id';
	const allowRowMovement = props.allowRowMovement ?? false;
	const translateFieldName = props.translateFieldName ?? (field => field);
	const t = useTranslate(props.translationNs ?? 'common');
	const [items, setItems] = React.useState<TableItem[]>(() => props.data.items);

	React.useEffect(() => {
		setItems(props.data.items);
	}, [props.data.items]);

	const selection = useSelectionController({
		items,
		valueKey,
		initialSelectedValues: props.initialSelectedValues,
		selectionGetterRef: props.selectionGetterRef,
	});
	const rowMove = useRowMoveController({ allowRowMovement, setItems });

	return (
		<Table
			withTableBorder
			withColumnBorders
			striped='even'
			highlightOnHover
			className={clsx({ 'select-none': allowRowMovement })}
		>
			<SettingsTableHead
				fields={props.data.desired_fields}
				translateFieldName={translateFieldName}
				isAllSelected={selection.isAllSelected}
				isIndeterminate={selection.isIndeterminate}
				onToggleAll={selection.toggleAllRows}
			/>
			<Table.Tbody>
				{items.map((item, rowIndex) => {
					const rowValue = getRowValue(item, valueKey);
					return (
						<SettingsTableRow
							key={`${rowValue}-${rowIndex}`}
							item={item}
							rowIndex={rowIndex}
							fields={props.data.desired_fields}
							maskedFields={props.data.masked_fields}
							fieldRenderer={props.fieldRenderer}
							t={t}
							rowValue={rowValue}
							isSelected={selection.selectedIds.has(rowValue)}
							allowRowMovement={allowRowMovement}
							rowMoveState={rowMove.rowMoveState}
							onRowClick={selection.toggleRowSelection}
							onCheckboxToggle={selection.toggleRowSelection}
							onDragStart={rowMove.startDragging}
							onDragOver={rowMove.onDragOver}
							onDrop={rowMove.onDrop}
							onDragEnd={rowMove.onDragEnd}
						/>
					);
				})}
			</Table.Tbody>
		</Table>
	);
}

function SettingsTableHead(props: {
	fields: string[],
	translateFieldName: (field: string) => string,
	isAllSelected: boolean,
	isIndeterminate: boolean,
	onToggleAll: () => void,
}): React.ReactNode {
	return (
		<Table.Thead>
			<Table.Tr>
				<Table.Th className='p-0 text-center align-middle relative' w={40}>
					<div className='flex items-center justify-center'>
						<Checkbox
							checked={props.isAllSelected}
							indeterminate={props.isIndeterminate}
							onChange={props.onToggleAll}
							aria-label='Select all rows'
						/>
					</div>
				</Table.Th>
				{props.fields.map(field => (
					<Table.Th key={field}>{props.translateFieldName(field)}</Table.Th>
				))}
			</Table.Tr>
		</Table.Thead>
	);
}

function SettingsTableRow(props: {
	item: TableItem,
	rowIndex: number,
	fields: string[],
	maskedFields: string[],
	fieldRenderer?: FieldRendererMap,
	t: TranslateFn,
	rowValue: string,
	isSelected: boolean,
	allowRowMovement: boolean,
	rowMoveState: RowMoveState,
	onRowClick: (rowValue: string) => void,
	onCheckboxToggle: (rowValue: string) => void,
	onDragStart: (rowIndex: number) => void,
	onDragOver: (event: React.DragEvent<HTMLTableRowElement>, rowIndex: number) => void,
	onDrop: (rowIndex: number) => void,
	onDragEnd: () => void,
}): React.ReactNode {
	const showDropIndicator = props.allowRowMovement && props.rowMoveState.dropIndex === props.rowIndex
		&& props.rowMoveState.draggingIndex !== null;
	return (
		<Table.Tr
			draggable={props.allowRowMovement}
			onDragStart={() => props.onDragStart(props.rowIndex)}
			onDragOver={event => props.onDragOver(event, props.rowIndex)}
			onDrop={() => props.onDrop(props.rowIndex)}
			onDragEnd={props.onDragEnd}
			onClick={() => props.onRowClick(props.rowValue)}
			className={clsx({ [classes.rowDropIndicator]: showDropIndicator })}
		>
			<Table.Td
				p={0}
				className={clsx('text-center align-middle', classes.rowNumberCell, {
					[classes.selectedCell]: props.isSelected,
				})}
				w={40}
			>
				<div className='flex items-center justify-center'>
					<Checkbox
						checked={props.isSelected}
						onChange={() => props.onCheckboxToggle(props.rowValue)}
						onClick={event => event.stopPropagation()}
						aria-label={`Select row ${props.rowIndex + 1}`}
					/>
				</div>
			</Table.Td>
			{props.fields.map(field => (
				<Table.Td
					key={field}
					className={clsx({
						[classes.selectedCell]: props.isSelected,
						'cursor-move': props.allowRowMovement,
					})}
				>
					{renderCellValue(
						field, props.item, props.maskedFields, props.fieldRenderer, props.t,
					)}
				</Table.Td>
			))}
		</Table.Tr>
	);
}

type SelectionController = {
	selectedIds: Set<string>,
	isAllSelected: boolean,
	isIndeterminate: boolean,
	toggleAllRows: () => void,
	toggleRowSelection: (rowValue: string) => void,
};

type RowMoveController = {
	rowMoveState: RowMoveState,
	startDragging: (rowIndex: number) => void,
	onDragOver: (event: React.DragEvent<HTMLTableRowElement>, rowIndex: number) => void,
	onDrop: (rowIndex: number) => void,
	onDragEnd: () => void,
};

function normalizeValue(value: unknown): string {
	return String(value ?? '');
}

function getRowValue(item: TableItem, valueKey: string): string {
	return normalizeValue(item[valueKey]);
}

function isMaskedField(field: string, maskedFields: string[]): boolean {
	return maskedFields.includes(field);
}

function renderCellValue(
	field: string,
	item: TableItem,
	maskedFields: string[],
	fieldRenderer: FieldRendererMap | undefined,
	t: TranslateFn,
): React.ReactNode {
	if (isMaskedField(field, maskedFields)) {
		return '********';
	}
	const value = normalizeValue(item[field]);
	const renderer = fieldRenderer?.[field];
	return renderer ? applyCustomRenderer(renderer, value, t) : value;
}

function moveRow(items: TableItem[], fromIndex: number, toIndex: number): TableItem[] {
	if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
		return items;
	}
	const safeToIndex = Math.min(Math.max(toIndex, 0), items.length - 1);
	const next = [...items];
	const [moved] = next.splice(fromIndex, 1);
	next.splice(safeToIndex, 0, moved);
	return next;
}

function toggleRowInSelectionSet(selected: Set<string>, rowValue: string): Set<string> {
	const next = new Set(selected);
	if (next.has(rowValue)) {
		next.delete(rowValue);
	}
	else {
		next.add(rowValue);
	}
	return next;
}

function useSelectionController(args: {
	items: TableItem[],
	valueKey: string,
	initialSelectedValues?: string[],
	selectionGetterRef?: React.RefObject<(() => string[]) | null>,
}): SelectionController {
	const [selectedIds, setSelectedIds] = React.useState<Set<string>>(() => new Set());

	React.useEffect(() => {
		const selectedValues = new Set(args.initialSelectedValues ?? []);
		if (selectedValues.size === 0) {
			setSelectedIds(new Set());
			return;
		}
		const next = new Set<string>();
		for (const item of args.items) {
			const rowValue = getRowValue(item, args.valueKey);
			if (selectedValues.has(rowValue)) {
				next.add(rowValue);
			}
		}
		setSelectedIds(next);
	}, [args.initialSelectedValues, args.items, args.valueKey]);

	React.useLayoutEffect(() => {
		const getterRef = args.selectionGetterRef;
		if (!getterRef) {
			return undefined;
		}
		getterRef.current = () => args.items
			.map(item => getRowValue(item, args.valueKey))
			.filter(value => selectedIds.has(value));
		return () => {
			getterRef.current = null;
		};
	}, [args.items, args.selectionGetterRef, args.valueKey, selectedIds]);

	const isAllSelected = args.items.length > 0 && selectedIds.size === args.items.length;
	const isIndeterminate = selectedIds.size > 0 && selectedIds.size < args.items.length;

	const toggleAllRows = React.useCallback(() => {
		if (isAllSelected) {
			setSelectedIds(new Set());
			return;
		}
		const next = new Set(args.items.map(item => getRowValue(item, args.valueKey)));
		setSelectedIds(next);
	}, [args.items, args.valueKey, isAllSelected]);

	const toggleRowSelection = React.useCallback((rowValue: string) => {
		setSelectedIds(prev => toggleRowInSelectionSet(prev, rowValue));
	}, []);

	return {
		selectedIds,
		isAllSelected,
		isIndeterminate,
		toggleAllRows,
		toggleRowSelection,
	};
}

function useRowMoveController(args: {
	allowRowMovement: boolean,
	setItems: React.Dispatch<React.SetStateAction<TableItem[]>>,
}): RowMoveController {
	const [rowMoveState, setRowMoveState] = React.useState<RowMoveState>({ draggingIndex: null, dropIndex: null });

	const startDragging = React.useCallback((rowIndex: number) => {
		if (!args.allowRowMovement) {
			return;
		}
		setRowMoveState({ draggingIndex: rowIndex, dropIndex: rowIndex });
	}, [args.allowRowMovement]);

	const onDragOver = React.useCallback((event: React.DragEvent<HTMLTableRowElement>, rowIndex: number) => {
		if (!args.allowRowMovement) {
			return;
		}
		event.preventDefault();
		setRowMoveState(prev => ({ ...prev, dropIndex: rowIndex }));
	}, [args.allowRowMovement]);

	const onDrop = React.useCallback((rowIndex: number) => {
		if (!args.allowRowMovement) {
			return;
		}
		args.setItems(prev => {
			const fromIndex = rowMoveState.draggingIndex ?? -1;
			return moveRow(prev, fromIndex, rowIndex);
		});
		setRowMoveState({ draggingIndex: null, dropIndex: null });
	}, [args.allowRowMovement, args.setItems, rowMoveState.draggingIndex]);

	const onDragEnd = React.useCallback(() => {
		setRowMoveState({ draggingIndex: null, dropIndex: null });
	}, []);

	return { rowMoveState, startDragging, onDragOver, onDrop, onDragEnd };
}
