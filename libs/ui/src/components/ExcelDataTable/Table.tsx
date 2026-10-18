import { Anchor, Group, Table as MantineTable } from '@mantine/core';
import clsx from 'clsx';
import React from 'react';
import { Link, useResolvedPath } from 'react-router-dom';

import { useCellDisplay } from './cells/CellContent';
import { getCellAlignment, getRowNumber, isArrayField, shouldUseSingleLineEllipsis } from './cells/cellValues';
import { useExcelDataTableContext } from './context';
import classes from './ExcelDataTable.module.css';
import { NewRow } from './NewRow';
import { DeleteRowAction, EditRowAction } from './rowActions';
import { isRowDeleteDisabled, isRowDeleteShown, isRowEditShown } from './rowDeleteModel';
import { EditingRow } from './RowEditor';
import { TableColGroup, getTableStyle, useBodyScrollSync, useColumnCount, useTableLayout } from './tableLayout';
import { tableScopeAttrs } from './tableScope';
import { rowIdOf } from './types';
import { useRowDelete } from './useRowDelete';
import { useTableKeyboard } from './useTableKeyboard';


import type { RowId, SearchItem } from './types';


export type TableProps = {
	className?: string,
	/** Overrides the Provider's `emptyMessage` for this body. */
	emptyText?: string,
};

/**
 * The data rows only; `TableHeader` draws the labels. The wrapper is the one scroll container:
 * vertical scrolling belongs to it, and its horizontal position is mirrored into the header.
 */
export function Table({ className, emptyText }: TableProps) {
	const { data, fields, columnWidths, isLoading, selection, tid, scopeId, emptyMessage } = useExcelDataTableContext();
	const scroller = useBodyScrollSync();
	const layout = useTableLayout();
	const columnCount = useColumnCount();
	const onKeyDown = useTableKeyboard();
	useFocusAfterEditing();
	const showEmpty = data.items.length === 0 && !isLoading;
	return (
		<div
			ref={scroller.ref}
			onScroll={scroller.onScroll}
			tabIndex={0}
			onKeyDown={onKeyDown}
			className={clsx(classes.bodyScroller, className)}
			{...tableScopeAttrs(scopeId)}
			{...tid.attrs('body')}
		>
			<MantineTable striped='even' highlightOnHover style={getTableStyle(fields, columnWidths.widths, layout)}>
				<TableColGroup fields={fields} widths={columnWidths.widths} layout={layout} />
				<MantineTable.Tbody>
					{data.items.map((item, rowIndex) => (
						<BodyRow key={rowIdOf(item, rowIndex)} item={item} rowIndex={rowIndex} />
					))}
					{showEmpty ? (
						<MantineTable.Tr>
							<MantineTable.Td colSpan={columnCount} className='text-center' {...tid.attrs('empty')}>
								{emptyText ?? emptyMessage}
							</MantineTable.Td>
						</MantineTable.Tr>
					) : null}
					<NewRow />
				</MantineTable.Tbody>
			</MantineTable>
			<span className='sr-only' aria-live='polite'>{selection.ids.length}</span>
		</div>
	);
}

/** A modified click or non-primary button means "open in new tab/window": never intercept those. */
export function isModifiedClick(event: React.MouseEvent): boolean {
	return event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0;
}

/** Data and filler cells: a plain primary press selects that row alone; anything else is the browser's. */
function useSelectOnlyPress(rowId: RowId): (event: React.MouseEvent) => void {
	const { selection } = useExcelDataTableContext();
	return (event: React.MouseEvent) => {
		if (!isModifiedClick(event)) {
			selection.selectRow(rowId);
		}
	};
}

type BodyRowProps = { item: SearchItem, rowIndex: number };

/**
 * Returns focus to the scroll container when inline editing ends.
 *
 * The editing row takes focus into its first input when it opens. When it closes — Escape, save,
 * or discard — that element unmounts and focus falls to `<body>`, where the arrow keys reach
 * nothing: the key handler lives on the scroller. Without this, leaving edit mode silently ends
 * keyboard navigation until the user clicks a row.
 */
function useFocusAfterEditing(): void {
	const { editing, scrollSync } = useExcelDataTableContext();
	const wasEditing = React.useRef(editing.isActive);
	React.useEffect(() => {
		if (wasEditing.current && !editing.isActive) {
			scrollSync.current.body?.focus({ preventScroll: true });
		}
		wasEditing.current = editing.isActive;
	}, [editing.isActive, scrollSync]);
}

function BodyRow({ item, rowIndex }: BodyRowProps) {
	const context = useExcelDataTableContext();
	const { data, fields, selection, editing, buildLinkHref, tid, canUpdateRows, indexColumnVisible } = context;
	const rowId = rowIdOf(item, rowIndex);
	const rowNumber = getRowNumber(data.page, data.size, rowIndex);
	const isSelected = selection.ids.includes(rowId);
	if (editing.rowId === rowId) {
		return <EditingRow item={item} rowId={rowId} rowNumber={rowNumber} />;
	}
	const linkHref = buildLinkHref?.(item);
	const onDoubleClick = () => {
		if (canUpdateRows && !editing.creating && selection.ids.length <= 1) {
			editing.start(rowId);
		}
	};
	return (
		<MantineTable.Tr
			aria-selected={isSelected}
			onDoubleClick={onDoubleClick}
			className={classes.bodyRow}
			{...tid.row(rowId)}
		>
			{indexColumnVisible ? <RowNumberCell rowId={rowId} rowNumber={rowNumber} isSelected={isSelected} /> : null}
			{fields.map(field => (
				<DataCell key={field} field={field} item={item} rowId={rowId} href={linkHref} isSelected={isSelected} />
			))}
			<RowActionsCell item={item} rowId={rowId} isSelected={isSelected} />
		</MantineTable.Tr>
	);
}

type RowActionsCellProps = { item: SearchItem, rowId: RowId, isSelected: boolean };

/**
 * The filler cell of a read row, holding its edit and delete when the table allows them. A press
 * on it selects its row like a data cell; a press on its buttons does not, so a delete never
 * re-selects. Its keys and double-clicks stay here: Enter on a button must not also open the row
 * editor.
 */
function RowActionsCell({ item, rowId, isSelected }: RowActionsCellProps) {
	const { capabilities } = useExcelDataTableContext();
	const onMouseDown = useSelectOnlyPress(rowId);
	const cellClass = clsx('align-middle', { [classes.selectedCell]: isSelected });
	const showEdit = isRowEditShown(capabilities);
	const showDelete = isRowDeleteShown(capabilities);
	if (!showEdit && !showDelete) {
		return <MantineTable.Td className={cellClass} onMouseDown={onMouseDown} aria-hidden />;
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
				className={clsx(classes.rowActions, { [classes.rowActionsVisible]: isSelected })}
				onMouseDown={event => event.stopPropagation()}
			>
				{showEdit ? <RowEditButton rowId={rowId} /> : null}
				{showDelete ? <RowDeleteButton item={item} rowId={rowId} /> : null}
			</Group>
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

type RowNumberCellProps = { rowId: RowId, rowNumber: number, isSelected: boolean };

/**
 * The gray handle, the one cell that deselects: a press toggles its row and starts a drag over the
 * other handles, Shift+press adds the range from the anchor, Space toggles.
 *
 * Pointer capture would hold `pointerenter` back from every other cell, which is what the drag
 * listens to. Mouse input is never captured implicitly, but touch and pen are, so it is released.
 */
function RowNumberCell({ rowId, rowNumber, isSelected }: RowNumberCellProps) {
	const { selection, tid } = useExcelDataTableContext();
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
			{rowNumber}
		</MantineTable.Td>
	);
}

type DataCellProps = { field: string, item: SearchItem, rowId: RowId, href?: string, isSelected: boolean };

function DataCell({ field, item, rowId, href, isSelected }: DataCellProps) {
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
			{href ? (
				<Anchor
					component={Link}
					to={resolved.pathname}
					className={classes.cellLink}
					tabIndex={-1}
				>
					{content}
				</Anchor>
			) : content}
		</MantineTable.Td>
	);
}
