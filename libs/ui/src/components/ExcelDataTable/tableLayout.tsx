import React from 'react';

import {
	defaultColumnWidth, defaultTableLayout, getAutoColumnWidth, getColumnCount, getColumnWidth, getRowActionsMinWidth,
	getTableMinWidth, rowNumberColumnWidth,
} from './columnWidths';
import { useExcelDataTableContext } from './context';

import type { TableLayout } from './columnWidths';
import type { ColumnWidths } from './types';


/**
 * `TableHeader` and `Table` are two `<table>`s. They line up because both are `table-layout:
 * fixed` with this same `<colgroup>` and the same width rule: the column widths alone decide
 * the layout, so identical inputs give identical columns.
 */
export type TableColGroupProps = { fields: string[], widths: ColumnWidths, layout?: TableLayout };

export function TableColGroup({ fields, widths, layout = defaultTableLayout }: TableColGroupProps) {
	return (
		<colgroup>
			{layout.indexColumnVisible ? <col style={{ width: rowNumberColumnWidth }} /> : null}
			{fields.map(field => <col key={field} style={{ width: getColumnWidth(field, widths) }} />)}
			<col style={{ minWidth: layout.fillerMinWidth }} />
		</colgroup>
	);
}

/** Fills the container, and grows past it (horizontal scroll) once the columns need more. */
export function getTableStyle(
	fields: string[], widths: ColumnWidths, layout: TableLayout = defaultTableLayout,
): React.CSSProperties {
	return { width: '100%', minWidth: getTableMinWidth(fields, widths, layout), tableLayout: 'fixed' };
}

/** The layout both `<table>`s share; header and body must read the same one or columns drift. */
export function useTableLayout(): TableLayout {
	const { indexColumnVisible, columnWidths, capabilities } = useExcelDataTableContext();
	const fillerMinWidth = Math.max(columnWidths.fillerMinWidth, getRowActionsMinWidth(capabilities));
	return React.useMemo(() => ({ indexColumnVisible, fillerMinWidth }), [indexColumnVisible, fillerMinWidth]);
}

/** The `colSpan` of a row that spans the whole table. */
export function useColumnCount(): number {
	const { fields } = useExcelDataTableContext();
	const layout = useTableLayout();
	return getColumnCount(fields.length, layout);
}

export function useColumnResize() {
	const { columnWidths, data } = useExcelDataTableContext();
	const onStartResize = React.useCallback((field: string, event: React.MouseEvent<HTMLDivElement>) => {
		event.preventDefault();
		columnWidths.setResizing({
			field, startX: event.clientX, startWidth: columnWidths.widths[field] ?? defaultColumnWidth,
		});
	}, [columnWidths]);
	const onAutoResize = React.useCallback((field: string) => {
		const next = getAutoColumnWidth(field, data);
		columnWidths.setWidths(prev => ({ ...prev, [field]: next }));
	}, [columnWidths, data]);
	return { onStartResize, onAutoResize };
}

/** The header's scroller: hidden overflow, following the body's `scrollLeft`. */
export function useHeaderScrollSync(): React.RefCallback<HTMLDivElement> {
	const { scrollSync } = useExcelDataTableContext();
	return React.useCallback((element: HTMLDivElement | null) => {
		scrollSync.current.header = element;
		if (element && scrollSync.current.body) {
			element.scrollLeft = scrollSync.current.body.scrollLeft;
		}
	}, [scrollSync]);
}

/** The body's scroller: the one real scroll container, pushing its `scrollLeft` to the header. */
export function useBodyScrollSync() {
	const { scrollSync } = useExcelDataTableContext();
	const ref = React.useCallback((element: HTMLDivElement | null) => {
		scrollSync.current.body = element;
	}, [scrollSync]);
	const onScroll = React.useCallback((event: React.UIEvent<HTMLDivElement>) => {
		const header = scrollSync.current.header;
		if (header && header.scrollLeft !== event.currentTarget.scrollLeft) {
			header.scrollLeft = event.currentTarget.scrollLeft;
		}
	}, [scrollSync]);
	return { ref, onScroll };
}
