import type * as dyn from '@nikkierp/common/dynamicModel';


export type SearchItem = Record<string, any>;
export type SearchData = dyn.RestSearchResponse<SearchItem>;

export type RowId = string | number;

export type ColumnWidths = Record<string, number>;
export type ResizeState = { field: string, startX: number, startWidth: number };

/**
 * A view mode is any string a page declares through `ViewModeButton mode=`; `list` is the one the
 * table itself renders, every other mode is the page's own container under `ForViewMode`.
 */
export type ExcelViewMode = string;

export const DEFAULT_VIEW_MODE: ExcelViewMode = 'list';

/** Reads the row's record id, falling back to the row index when the record has none. */
export function rowIdOf(item: SearchItem | undefined, rowIndex: number): RowId {
	const id = item?.id;
	return typeof id === 'string' || typeof id === 'number' ? id : rowIndex;
}
