import { Table as MantineTable } from '@mantine/core';
import clsx from 'clsx';
import React from 'react';

import { BodyRow } from './BodyRow';
import { getRowNumber } from './cells/cellValues';
import { useExcelDataTableContext } from './context';
import classes from './ExcelDataTable.module.css';
import { ManualSortArea, ManualSortRow } from './manualSort/ManualSort';
import { NewRow } from './NewRow';
import { EditingRow } from './RowEditor';
import {
	tableDensityVars, TableGeometryColGroup, useBodyScrollSync, useColumnCount, useTableGeometry,
} from './tableLayout';
import { tableScopeAttrs } from './tableScope';
import { rowIdOf } from './types';
import { TableScopeRow } from './updateScope/TableScopeRow';
import { useTableKeyboard } from './useTableKeyboard';

import type { SearchItem } from './types';


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
	const { data, isLoading, selection, tid, scopeId, emptyMessage } = useExcelDataTableContext();
	const scroller = useBodyScrollSync();
	const geometry = useTableGeometry();
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
			<ManualSortArea>
				<MantineTable striped='even' highlightOnHover style={geometry.style} vars={tableDensityVars}>
					<TableGeometryColGroup geometry={geometry} />
					<MantineTable.Tbody>
						{data.items.map((item, rowIndex) => (
							<SortableBodyRow key={rowIdOf(item, rowIndex)} item={item} rowIndex={rowIndex} />
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
			</ManualSortArea>
			<span className='sr-only' aria-live='polite'>{selection.ids.length}</span>
		</div>
	);
}

export { isModifiedClick } from './rowPress';

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

type RowProps = { item: SearchItem, rowIndex: number };

function SortableBodyRow({ item, rowIndex }: RowProps) {
	const { manualSort } = useExcelDataTableContext();
	const row = <RowOfMode item={item} rowIndex={rowIndex} />;
	return manualSort.enabled ? <ManualSortRow rowId={rowIdOf(item, rowIndex)}>{row}</ManualSortRow> : row;
}

/** The row as the table's mode wants it: the open row editor, every editor at once, or read. */
function RowOfMode({ item, rowIndex }: RowProps) {
	const { data, editing, tableEditing } = useExcelDataTableContext();
	const rowId = rowIdOf(item, rowIndex);
	const rowNumber = getRowNumber(data.page, data.size, rowIndex);
	if (tableEditing) {
		return <TableScopeRow item={item} rowId={rowId} rowNumber={rowNumber} />;
	}
	if (editing.rowId === rowId) {
		return <EditingRow item={item} rowId={rowId} rowNumber={rowNumber} />;
	}
	return <BodyRow item={item} rowIndex={rowIndex} />;
}
