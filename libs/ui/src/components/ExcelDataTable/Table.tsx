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
import { EditingRow } from './RowEditor';
import { TableColGroup, getTableStyle, useBodyScrollSync } from './tableLayout';
import { rowIdOf } from './types';
import { useTableKeyboard } from './useTableKeyboard';
import { useTranslate } from '../../i18n';


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
	const { data, fields, columnWidths, isLoading, selection, tid } = useExcelDataTableContext();
	const scroller = useBodyScrollSync();
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
			{...tid.attrs('body')}
		>
			<MantineTable
				withTableBorder
				withColumnBorders
				striped='even'
				highlightOnHover
				style={getTableStyle(fields, columnWidths.widths)}
			>
				<TableColGroup fields={fields} widths={columnWidths.widths} />
				<MantineTable.Tbody>
					{data.items.map((item, rowIndex) => (
						<BodyRow key={rowIdOf(item, rowIndex)} item={item} rowIndex={rowIndex} />
					))}
					{showEmpty ? (
						<MantineTable.Tr>
							<MantineTable.Td colSpan={fields.length + 2} className='text-center'>
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
	const wasEditing = React.useRef(editing.rowId !== null);
	React.useEffect(() => {
		const isEditing = editing.rowId !== null;
		if (wasEditing.current && !isEditing) {
			scrollSync.current.body?.focus({ preventScroll: true });
		}
		wasEditing.current = isEditing;
	}, [editing.rowId, scrollSync]);
}

function BodyRow({ item, rowIndex }: BodyRowProps) {
	const context = useExcelDataTableContext();
	const { data, fields, selection, editing, buildLinkHref, tid, updateCommand } = context;
	const rowId = rowIdOf(item, rowIndex);
	const rowNumber = getRowNumber(data.page, data.size, rowIndex);
	const isSelected = selection.ids.includes(rowId);
	if (editing.rowId === rowId) {
		return <EditingRow item={item} rowId={rowId} rowNumber={rowNumber} />;
	}
	const linkHref = buildLinkHref?.(item);
	const onDoubleClick = () => {
		if (updateCommand && selection.ids.length <= 1) {
			editing.start(rowId);
		}
	};
	return (
		<MantineTable.Tr aria-selected={isSelected} onDoubleClick={onDoubleClick} {...tid.row(rowId)}>
			<RowNumberCell rowId={rowId} rowNumber={rowNumber} isSelected={isSelected} />
			{fields.map(field => (
				<DataCell key={field} field={field} item={item} rowId={rowId} href={linkHref} isSelected={isSelected} />
			))}
			<MantineTable.Td className={clsx({ [classes.selectedCell]: isSelected })} aria-hidden />
		</MantineTable.Tr>
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
	const resolved = useResolvedPath(href ?? '.');
	const fieldSchema = getFieldSchema(modelSchema, field, relatedSchemas);
	const renderer = fieldRenderers[field];
	const edgeLabel = resolveEdgeLabel(item, field, modelSchema, relatedSchemas);
	const rawValue = edgeLabel ?? getCellValue(item, field);
	const text = edgeLabel ?? getCellText(item, field, data.masked_fields);
	const content = React.useMemo(
		() => (edgeLabel !== undefined && !renderer
			? edgeLabel
			: renderDataCellContent(rawValue, text, fieldSchema, renderer, t)),
		[edgeLabel, fieldSchema, rawValue, renderer, t, text],
	);
	const useEllipsis = shouldUseSingleLineEllipsis(text) && !isArrayField(fieldSchema);
	const onMouseDown = (event: React.MouseEvent<HTMLTableCellElement>) => {
		if (!isModifiedClick(event)) {
			selection.selectRow(rowId);
		}
	};
	// The plain click was consumed by the selection on mousedown; modified clicks reach the link.
	const onAnchorClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
		if (!isModifiedClick(event)) {
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
