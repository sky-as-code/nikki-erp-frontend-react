import { Anchor, Group, Table as MantineTable } from '@mantine/core';
import clsx from 'clsx';
import React from 'react';
import { Link, useResolvedPath } from 'react-router-dom';

import { ActionColumnCell } from './actionColumns/ActionColumnCell';
import { useCellDisplay } from './cells/CellContent';
import { getCellAlignment, getRowNumber, isArrayField, shouldUseSingleLineEllipsis } from './cells/cellValues';
import { CHANGE_BADGE_INDEX_SLOT, RowChangeBadge, useChangeBadgeSlot } from './changeIndicator/RowChangeBadge';
import { useExcelDataTableContext } from './context';
import classes from './ExcelDataTable.module.css';
import { SortHandleCell, useSortableRowProps } from './manualSort/ManualSort';
import { DeleteRowAction, EditRowAction } from './rowActions';
import { isRowDeleteDisabled, isRowDeleteShown, isRowEditShown } from './rowDeleteModel';
import { useSelectOnlyPress } from './rowPress';
import { rowIdOf } from './types';
import { useRowDelete } from './useRowDelete';

import type { RowId, SearchItem } from './types';


export type BodyRowProps = { item: SearchItem, rowIndex: number };

/** A read row: index, sort handle, data and action cells, and the built-in action column. */
export function BodyRow({ item, rowIndex }: BodyRowProps) {
	const context = useExcelDataTableContext();
	const { data, columns, selection, editing, buildLinkHref, tid, canUpdateRows, indexColumnVisible } = context;
	const rowId = rowIdOf(item, rowIndex);
	const rowNumber = getRowNumber(data.page, data.size, rowIndex);
	const isSelected = selection.ids.includes(rowId);
	const sortableProps = useSortableRowProps();
	const badgeSlot = useChangeBadgeSlot();
	const linkHref = buildLinkHref?.(item);
	const onDoubleClick = () => {
		if (canUpdateRows && !editing.creating && selection.ids.length <= 1) {
			editing.start(rowId);
		}
	};
	return (
		<MantineTable.Tr
			{...sortableProps}
			aria-selected={isSelected}
			onDoubleClick={onDoubleClick}
			className={classes.bodyRow}
			{...tid.row(rowId)}
		>
			{indexColumnVisible ? (
				<RowNumberCell item={item} rowId={rowId} rowNumber={rowNumber} isSelected={isSelected} />
			) : null}
			{context.manualSort.enabled ? <SortHandleCell rowId={rowId} /> : null}
			{columns.map(column => (column.kind === 'action' ? (
				<ActionColumnCell
					key={column.key}
					column={column.column}
					item={item}
					rowId={rowId}
					isSelected={isSelected}
				/>
			) : (
				<DataCell
					key={column.key}
					field={column.field}
					item={item}
					rowId={rowId}
					href={linkHref}
					isSelected={isSelected}
					withBadge={badgeSlot === column.key}
				/>
			)))}
			<RowActionsCell item={item} rowId={rowId} isSelected={isSelected} />
		</MantineTable.Tr>
	);
}

type RowActionsCellProps = {
	item: SearchItem,
	rowId: RowId,
	isSelected: boolean,
	/** Shown under the buttons, e.g. a table-scope row's write errors. */
	children?: React.ReactNode,
};

/**
 * The built-in action column of a read row, holding its edit and delete when the table allows
 * them. A press on it selects its row like a data cell; a press on its buttons does not, so a
 * delete never re-selects. Its keys and double-clicks stay here: Enter on a button must not also
 * open the row editor. In table scope there is no row editor, and Delete is always shown.
 */
export function RowActionsCell({ item, rowId, isSelected, children }: RowActionsCellProps) {
	const { capabilities, updateScope } = useExcelDataTableContext();
	const onMouseDown = useSelectOnlyPress(rowId);
	const cellClass = clsx('align-middle', { [classes.selectedCell]: isSelected });
	const showEdit = updateScope === 'row' && isRowEditShown(capabilities);
	const showDelete = isRowDeleteShown(capabilities);
	if (!showEdit && !showDelete) {
		return (
			<MantineTable.Td className={cellClass} onMouseDown={onMouseDown} aria-hidden={!children}>
				{children}
			</MantineTable.Td>
		);
	}
	return (
		<MantineTable.Td
			className={cellClass}
			onMouseDown={onMouseDown}
			onKeyDown={event => event.stopPropagation()}
			onDoubleClick={event => event.stopPropagation()}
		>
			<Group
				gap='xs'
				wrap='nowrap'
				className={clsx(classes.rowActions, { [classes.rowActionsVisible]: isSelected || updateScope === 'table' })}
				onMouseDown={event => event.stopPropagation()}
			>
				{showEdit ? <RowEditButton rowId={rowId} /> : null}
				{showDelete ? <RowDeleteButton item={item} rowId={rowId} /> : null}
			</Group>
			{children}
		</MantineTable.Td>
	);
}

/** Selects the row first: an edit lives only while its row is the selection. */
function RowEditButton({ rowId }: { rowId: RowId }) {
	const { locks, editing, isLoading, selection, tid } = useExcelDataTableContext();
	const onEdit = () => {
		selection.selectRow(rowId);
		editing.start(rowId);
	};
	return (
		<EditRowAction
			onEdit={onEdit}
			disabled={editing.creating || isLoading || editing.rowId === rowId}
			locked={locks.update.locked}
			lockedMissing={locks.update.missing}
			testId={tid.rowEdit(rowId)}
		/>
	);
}

function RowDeleteButton({ item, rowId }: { item: SearchItem, rowId: RowId }) {
	const { locks, editing, isLoading, tid, btnDeleteLabel } = useExcelDataTableContext();
	const rowDelete = useRowDelete(item);
	const disabled = !rowDelete.isDeletable
		|| isRowDeleteDisabled({ isEditing: editing.isActive, isLoading, isDeleting: rowDelete.isDeleting });
	return (
		<DeleteRowAction
			onDelete={() => void rowDelete.onDelete()}
			disabled={disabled}
			locked={locks.delete.locked}
			lockedMissing={locks.delete.missing}
			label={btnDeleteLabel}
			testId={tid.rowDelete(rowId)}
		/>
	);
}

type RowNumberCellProps = { item: SearchItem, rowId: RowId, rowNumber: number, isSelected: boolean };

/**
 * The gray handle, the one cell that deselects: a press toggles its row and starts a drag over the
 * other handles, Shift+press adds the range from the anchor, Space toggles. It also carries the
 * row's change badge.
 *
 * Pointer capture would hold `pointerenter` back from every other cell, which is what the drag
 * listens to. Mouse input is never captured implicitly, but touch and pen are, so it is released.
 */
export function RowNumberCell({ item, rowId, rowNumber, isSelected }: RowNumberCellProps) {
	const { selection, tid } = useExcelDataTableContext();
	const withBadge = useChangeBadgeSlot() === CHANGE_BADGE_INDEX_SLOT;
	const onPointerDown = (event: React.PointerEvent<HTMLTableCellElement>) => {
		if (event.button !== 0) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		const cell = event.currentTarget;
		if (cell.hasPointerCapture?.(event.pointerId)) {
			cell.releasePointerCapture(event.pointerId);
		}
		if (event.shiftKey) {
			selection.selectRange(rowId);
			return;
		}
		selection.startDrag(rowId);
	};
	const onKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === ' ') {
			event.preventDefault();
			selection.toggleRow(rowId);
		}
	};
	return (
		<MantineTable.Td
			className={clsx('text-center align-middle', classes.rowNumberCell, { [classes.selectedCell]: isSelected })}
			onPointerDown={onPointerDown}
			onPointerEnter={() => selection.dragOver(rowId)}
			onKeyDown={onKeyDown}
			tabIndex={-1}
			aria-label={`Row ${rowNumber}`}
			{...tid.rowSelect(rowId)}
		>
			{withBadge ? <IndexWithBadge item={item} rowId={rowId} rowNumber={rowNumber} /> : rowNumber}
		</MantineTable.Td>
	);
}

function IndexWithBadge({ item, rowId, rowNumber }: { item: SearchItem, rowId: RowId, rowNumber: number }) {
	return (
		<Group gap={4} wrap='nowrap' justify='center'>
			<span>{rowNumber}</span>
			<RowChangeBadge item={item} rowId={rowId} />
		</Group>
	);
}

type DataCellProps = {
	field: string,
	item: SearchItem,
	rowId: RowId,
	href?: string,
	isSelected: boolean,
	withBadge: boolean,
};

function DataCell({ field, item, rowId, href, isSelected, withBadge }: DataCellProps) {
	const { tid } = useExcelDataTableContext();
	const resolved = useResolvedPath(href ?? '.');
	const { content, text, fieldSchema, renderer } = useCellDisplay(item, field);
	const useEllipsis = shouldUseSingleLineEllipsis(text) && !isArrayField(fieldSchema);
	// A plain click selects the row *and* follows the link, which is what opens the detail pane
	// beside the list in a split view. Selecting without navigating left the click looking dead on
	// a page whose whole point is that pane; the row handle is there for multi-selection.
	//
	// A modified click selects nothing and is left to the browser, which is what keeps Ctrl/Cmd
	// "open in a new tab" working from a cell.
	const onMouseDown = useSelectOnlyPress(rowId);
	const value = href ? (
		<Anchor component={Link} to={resolved.pathname} className={classes.cellLink} tabIndex={-1}>
			{content}
		</Anchor>
	) : content;
	return (
		<MantineTable.Td
			onMouseDown={onMouseDown}
			title={useEllipsis ? text : undefined}
			className={clsx({
				[classes.selectedCell]: isSelected,
				'overflow-hidden text-ellipsis whitespace-nowrap': useEllipsis,
				'whitespace-normal break-words': !useEllipsis,
				'text-right': getCellAlignment(fieldSchema, renderer) === 'right',
			})}
			{...tid.rowCell(rowId, field)}
		>
			{withBadge ? <BadgedValue item={item} rowId={rowId}>{value}</BadgedValue> : value}
		</MantineTable.Td>
	);
}

/** The first data cell's value with the change badge before it, when the index column is hidden. */
export function BadgedValue({ item, rowId, children }: { item: SearchItem, rowId: RowId, children: React.ReactNode }) {
	return (
		<Group gap={6} wrap='nowrap' className='min-w-0'>
			<RowChangeBadge item={item} rowId={rowId} />
			<div className='min-w-0 flex-1'>{children}</div>
		</Group>
	);
}
