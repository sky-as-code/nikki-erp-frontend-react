import { Checkbox, Table } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import clsx from 'clsx';
import React from 'react';

import { applyCustomRenderer } from './cellRenderers';
import classes from './DataTable.module.css';
import { TranslateFn, useTranslate } from '../../i18n';

import type { FieldRendererMap } from '@nikkierp/viewengine/core';



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
	/**
	 * Controlled selection. When set, the table owns no selection state: it renders exactly
	 * these values as checked and reports every change through `onSelectionChange`. Unlike
	 * `initialSelectedValues` the set is never intersected with the visible rows, so a
	 * selection made on one page survives paging and filtering.
	 */
	selectedValues?: string[],
	onSelectionChange?: (values: string[]) => void,
	/** Rendered in place of the rows when there is nothing to show. */
	emptyState?: React.ReactNode,
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
		selectedValues: props.selectedValues,
		onSelectionChange: props.onSelectionChange,
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
				{items.length === 0 && props.emptyState != null && (
					<Table.Tr>
						<Table.Td colSpan={props.data.desired_fields.length + 1} className='text-center'>
							{props.emptyState}
						</Table.Td>
					</Table.Tr>
				)}
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

export function toggleRowInSelectionSet(selected: Set<string>, rowValue: string): Set<string> {
	const next = new Set(selected);
	if (next.has(rowValue)) {
		next.delete(rowValue);
	}
	else {
		next.add(rowValue);
	}
	return next;
}

/**
 * Uncontrolled preselection: only rows present on this page can be selected, because the
 * uncontrolled table has no way to represent a selection it cannot render.
 */
export function resolvePreselection(pageValues: string[], preselected?: string[]): Set<string> {
	const wanted = new Set(preselected ?? []);
	if (wanted.size === 0) {
		return new Set();
	}
	return new Set(pageValues.filter(value => wanted.has(value)));
}

/**
 * Header checkbox state, computed against the visible page only. A controlled selection may
 * hold ids belonging to other pages, and those must not make the header read as "everything
 * here is selected".
 */
export function selectionFlags(pageValues: string[], selectedIds: Set<string>): {
	isAllSelected: boolean,
	isIndeterminate: boolean,
} {
	const selectedOnPage = pageValues.filter(value => selectedIds.has(value)).length;
	const isAllSelected = pageValues.length > 0 && selectedOnPage === pageValues.length;
	return { isAllSelected, isIndeterminate: selectedOnPage > 0 && !isAllSelected };
}

/**
 * Select-all unions the current page into the selection and deselect-all subtracts it, rather
 * than replacing the whole set, so selections made on other pages survive.
 */
export function toggleAllOnPage(
	selectedIds: Set<string>, pageValues: string[], isAllSelected: boolean,
): Set<string> {
	const next = new Set(selectedIds);
	pageValues.forEach(value => (isAllSelected ? next.delete(value) : next.add(value)));
	return next;
}

type SelectionArgs = {
	items: TableItem[],
	valueKey: string,
	initialSelectedValues?: string[],
	selectedValues?: string[],
	onSelectionChange?: (values: string[]) => void,
	selectionGetterRef?: React.RefObject<(() => string[]) | null>,
};

function usePageValues(items: TableItem[], valueKey: string): string[] {
	return React.useMemo(
		() => items.map(item => getRowValue(item, valueKey)),
		[items, valueKey],
	);
}

/**
 * Resolves the selected set and the way to change it, for both the controlled and the
 * uncontrolled caller.
 */
function useSelectionSet(args: SelectionArgs, pageValues: string[]): {
	selectedIds: Set<string>,
	commit: (next: Set<string>) => void,
} {
	const isControlled = args.selectedValues !== undefined;
	const [internalIds, setInternalIds] = React.useState<Set<string>>(() => new Set());

	React.useEffect(() => {
		// Uncontrolled preselection is intersected with the visible rows and re-derived
		// whenever they change. A controlled selection must not inherit that: it spans pages,
		// and re-deriving would discard the caller's edits on every filter change.
		if (isControlled) {
			return;
		}
		setInternalIds(resolvePreselection(pageValues, args.initialSelectedValues));
	}, [args.initialSelectedValues, isControlled, pageValues]);

	const selectedIds = React.useMemo(
		() => (args.selectedValues ? new Set(args.selectedValues) : internalIds),
		[args.selectedValues, internalIds],
	);
	const commit = React.useCallback((next: Set<string>) => {
		if (!isControlled) {
			setInternalIds(next);
		}
		args.onSelectionChange?.([...next]);
	}, [args.onSelectionChange, isControlled]);

	return { selectedIds, commit };
}

function useSelectionGetter(
	getterRef: React.RefObject<(() => string[]) | null> | undefined,
	pageValues: string[],
	selectedIds: Set<string>,
): void {
	React.useLayoutEffect(() => {
		if (!getterRef) {
			return undefined;
		}
		getterRef.current = () => pageValues.filter(value => selectedIds.has(value));
		return () => {
			getterRef.current = null;
		};
	}, [getterRef, pageValues, selectedIds]);
}

function useSelectionController(args: SelectionArgs): SelectionController {
	const pageValues = usePageValues(args.items, args.valueKey);
	const { selectedIds, commit } = useSelectionSet(args, pageValues);
	useSelectionGetter(args.selectionGetterRef, pageValues, selectedIds);

	const { isAllSelected, isIndeterminate } = selectionFlags(pageValues, selectedIds);

	const toggleAllRows = React.useCallback(() => {
		commit(toggleAllOnPage(selectedIds, pageValues, isAllSelected));
	}, [commit, isAllSelected, pageValues, selectedIds]);

	const toggleRowSelection = React.useCallback((rowValue: string) => {
		commit(toggleRowInSelectionSet(selectedIds, rowValue));
	}, [commit, selectedIds]);

	return { selectedIds, isAllSelected, isIndeterminate, toggleAllRows, toggleRowSelection };
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
