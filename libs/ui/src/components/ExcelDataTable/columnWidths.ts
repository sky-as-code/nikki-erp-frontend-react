import React from 'react';

import { getCellText } from './cells/cellValues';

import type { ColumnWidths, ExcelDataTableCapability, ResizeState, SearchData } from './types';


export const rowNumberColumnWidth = 64;
/** The index column with room for a "Changed" badge beside the row number. */
export const rowNumberWithBadgeColumnWidth = 112;
export const sortHandleColumnWidth = 28;
export const defaultColumnWidth = 200;
export const minimumColumnWidth = 80;
const maximumAutoColumnWidth = 500;
const characterPixelWidth = 8;
const cellHorizontalPadding = 32;

export function getColumnWidth(field: string, widths: ColumnWidths): number {
	return widths[field] ?? defaultColumnWidth;
}

/**
 * What besides the displayed columns takes width: the index column, the manual sort handle column
 * and the trailing filler (built-in action) column.
 */
export type TableLayout = {
	indexColumnVisible: boolean,
	fillerMinWidth: number,
	sortHandleVisible?: boolean,
	/** Defaults to {@link rowNumberColumnWidth}. */
	indexColumnWidth?: number,
};

export const defaultTableLayout: TableLayout = { indexColumnVisible: true, fillerMinWidth: 0 };

/** Every `<td>` a full-width row spans: the columns, the filler, and the index and handle columns when shown. */
export function getColumnCount(fieldCount: number, layout: TableLayout = defaultTableLayout): number {
	return fieldCount + 1 + (layout.indexColumnVisible ? 1 : 0) + (layout.sortHandleVisible ? 1 : 0);
}

export function getIndexColumnWidth(layout: TableLayout = defaultTableLayout): number {
	return layout.indexColumnWidth ?? rowNumberColumnWidth;
}

/**
 * The filler's minimum counts here, so resizing a column grows the table past its container
 * (horizontal scroll) instead of squeezing the filler below what its header needs.
 */
export function getTableMinWidth(fields: string[], widths: ColumnWidths, layout: TableLayout = defaultTableLayout) {
	const fixed = (layout.indexColumnVisible ? getIndexColumnWidth(layout) : 0) + layout.fillerMinWidth
		+ (layout.sortHandleVisible ? sortHandleColumnWidth : 0);
	return fields.reduce((sum, field) => sum + getColumnWidth(field, widths), fixed);
}

/** An xs `[Delete]`, and an xs `[Save]` + `[Discard changes]` pair, with the cell's padding. */
const rowDeleteActionWidth = 112;
const rowEditActionsWidth = 248;

/**
 * The room the filler needs for the buttons its rows put there, so a crowded table scrolls instead
 * of clipping them. A header's own `fillerColumnMinWidth` can only raise it.
 */
export function getRowActionsMinWidth(capabilities: readonly ExcelDataTableCapability[]): number {
	if (capabilities.includes('update') || capabilities.includes('create')) {
		return rowEditActionsWidth;
	}
	return capabilities.includes('delete') ? rowDeleteActionWidth : 0;
}

export function getColumnStyle(width: number): React.CSSProperties {
	return { width, minWidth: 0, maxWidth: 'none' };
}

export function getAutoColumnWidth(field: string, searchData: SearchData): number {
	const longest = searchData.items.reduce((max, item) => {
		const value = getCellText(item, field, searchData.masked_fields);
		return Math.max(max, value.length);
	}, field.length);
	const estimated = (longest * characterPixelWidth) + cellHorizontalPadding;
	return Math.min(maximumAutoColumnWidth, Math.max(minimumColumnWidth, estimated));
}

export function useColumnWidthsState(initialWidths?: ColumnWidths) {
	const [widths, setWidths] = React.useState<ColumnWidths>(() => ({ ...initialWidths }));
	const [resizing, setResizing] = React.useState<ResizeState | null>(null);
	// Set by `TableHeader`, which owns the prop, and read by `Table`, whose colgroup must match.
	const [fillerMinWidth, setFillerMinWidth] = React.useState(0);

	React.useEffect(() => {
		if (!resizing) {
			return undefined;
		}
		const onMove = (e: MouseEvent) => setWidths(prev => ({
			...prev,
			[resizing.field]: Math.max(minimumColumnWidth, resizing.startWidth + e.clientX - resizing.startX),
		}));
		const onUp = () => setResizing(null);
		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
		return () => {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		};
	}, [resizing]);

	return { widths, setWidths, resizing, setResizing, fillerMinWidth, setFillerMinWidth };
}
