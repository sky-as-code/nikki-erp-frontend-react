import { Anchor, Table as MantineTable } from '@mantine/core';
import clsx from 'clsx';
import React from 'react';
import { Link, useResolvedPath } from 'react-router-dom';

import {
	getCellAlignment, getCellText, getCellValue, getFieldSchema, getRowNumber, isArrayField, renderDataCellContent,
	resolveEdgeLabel, shouldUseSingleLineEllipsis,
} from './cells/cellValues';
import { useExcelDataTableContext } from './context';
import classes from './ExcelDataTable.module.css';
import { NewRowSlot } from './NewRowSlot';
import { DeleteRowAction } from './rowActions';
import { isRowDeleteDisabled, isRowDeleteShown } from './rowDeleteModel';
import { EditingRow } from './RowEditor';
import { TableColGroup, getTableStyle, useBodyScrollSync, useColumnCount, useTableLayout } from './tableLayout';
import { rowIdOf } from './types';
import { useRowDelete } from './useRowDelete';
import { useTableKeyboard } from './useTableKeyboard';
import { useI18n, useTranslate } from '../../i18n';


import type { RowId, SearchItem } from './types';


export type TableProps = {
	className?: string,
	/** Shown in place of rows when the result set is empty and nothing is loading. */
	emptyText?: string,
};

/**
 * The data rows only; `TableHeader` draws the labels. The wrapper is the one scroll container:
 * vertical scrolling belongs to it, and its horizontal position is mirrored into the header.
 */
export function Table({ className, emptyText }: TableProps) {
	const t = useTranslate('common');
	const { data, fields, columnWidths, isLoading, selection, capabilities, tid } = useExcelDataTableContext();
	const scroller = useBodyScrollSync();
	const layout = useTableLayout();
	const columnCount = useColumnCount();
	const onKeyDown = useTableKeyboard();
	useFocusAfterEditing();
	// A table rows can be added to always ends in the insert row, which already says what to do next.
	const showEmpty = data.items.length === 0 && !isLoading && !capabilities.includes('create');
	return (
		<div
			ref={scroller.ref}
			onScroll={scroller.onScroll}
			tabIndex={0}
			onKeyDown={onKeyDown}
			className={clsx(classes.bodyScroller, className)}
			{...tid.attrs('body')}
		>
			<MantineTable striped='even' highlightOnHover style={getTableStyle(fields, columnWidths.widths, layout)}>
				<TableColGroup fields={fields} widths={columnWidths.widths} layout={layout} />
				<MantineTable.Tbody>
					{data.items.map((item, rowIndex) => (
						<BodyRow key={rowIdOf(item, rowIndex)} item={item} rowIndex={rowIndex} />
					))}
					<NewRowSlot />
					{showEmpty ? (
						<MantineTable.Tr>
							<MantineTable.Td colSpan={columnCount} className='text-center'>
								{emptyText ?? t('search.noResults')}
							</MantineTable.Td>
						</MantineTable.Tr>
					) : null}
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
 * The filler cell of a read row, holding its delete when the table may delete. Its keys and
 * double-clicks stay here: Enter on the button must not also open the row editor.
 */
function RowActionsCell({ item, rowId, isSelected }: RowActionsCellProps) {
	const { capabilities, locks, editing, isLoading, tid } = useExcelDataTableContext();
	const rowDelete = useRowDelete(item);
	const cellClass = clsx('align-middle', { [classes.selectedCell]: isSelected });
	if (!isRowDeleteShown(capabilities)) {
		return <MantineTable.Td className={cellClass} aria-hidden />;
	}
	const disabled = !rowDelete.isDeletable
		|| isRowDeleteDisabled({ isEditing: editing.isActive, isLoading, isDeleting: rowDelete.isDeleting });
	return (
		<MantineTable.Td
			className={cellClass}
			onKeyDown={event => event.stopPropagation()}
			onDoubleClick={event => event.stopPropagation()}
		>
			<div className={clsx(classes.rowActions, { [classes.rowActionsVisible]: isSelected })}>
				<DeleteRowAction
					onDelete={() => void rowDelete.onDelete()}
					disabled={disabled}
					locked={locks.delete.locked}
					lockedMissing={locks.delete.missing}
					testId={tid.rowDelete(rowId)}
				/>
			</div>
		</MantineTable.Td>
	);
}

type RowNumberCellProps = { rowId: RowId, rowNumber: number, isSelected: boolean };

/** The gray handle: plain, Ctrl, Shift and Ctrl+Shift clicks, and Space, drive the selection. */
function RowNumberCell({ rowId, rowNumber, isSelected }: RowNumberCellProps) {
	const { selection, tid } = useExcelDataTableContext();
	const onMouseDown = (event: React.MouseEvent | React.KeyboardEvent) => {
		event.preventDefault();
		event.stopPropagation();
		selection.selectRow(rowId, { ctrl: event.ctrlKey || event.metaKey, shift: event.shiftKey });
	};
	return (
		<MantineTable.Td
			className={clsx('text-center align-middle', classes.rowNumberCell, { [classes.selectedCell]: isSelected })}
			onMouseDown={onMouseDown}
			onKeyDown={event => event.key === ' ' && onMouseDown(event)}
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
	const context = useExcelDataTableContext();
	const { modelSchema, relatedSchemas, fieldRenderers, selection, tid, data } = context;
	const t = useTranslate(context.translationNs);
	const { language } = useI18n();
	const resolved = useResolvedPath(href ?? '.');
	const fieldSchema = getFieldSchema(modelSchema, field, relatedSchemas);
	const renderer = fieldRenderers[field];
	const edgeLabel = resolveEdgeLabel(item, field, modelSchema, relatedSchemas, language);
	const rawValue = edgeLabel ?? getCellValue(item, field);
	const text = edgeLabel ?? getCellText(item, field, data.masked_fields);
	const content = React.useMemo(
		() => (edgeLabel !== undefined && !renderer
			? edgeLabel
			: renderDataCellContent(rawValue, text, fieldSchema, renderer, t, item)),
		[edgeLabel, fieldSchema, item, rawValue, renderer, t, text],
	);
	const useEllipsis = shouldUseSingleLineEllipsis(text) && !isArrayField(fieldSchema);
	const onMouseDown = (event: React.MouseEvent<HTMLTableCellElement>) => {
		if (!isModifiedClick(event)) {
			selection.selectRow(rowId);
		}
	};
	// A plain click selects the row *and* follows the link, which is what opens the detail pane
	// beside the list in a split view. Selecting without navigating left the click looking dead on
	// a page whose whole point is that pane; the row handle is there for selection alone.
	//
	// Ctrl and Shift are the selection gestures, so they must not also navigate. Everything else —
	// a middle click, Ctrl+Shift — is left to the browser, which is what keeps "open in a new tab"
	// working from a cell.
	const onAnchorClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
		if (event.ctrlKey || event.metaKey || event.shiftKey) {
			event.preventDefault();
		}
	};
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
					onClick={onAnchorClick}
				>
					{content}
				</Anchor>
			) : content}
		</MantineTable.Td>
	);
}
