import type * as dyn from '@nikkierp/common/dynamicModel';


export type SearchItem = Record<string, any>;
export type SearchData = dyn.RestSearchResponse<SearchItem>;

export type RowSelection = Record<number, boolean>;
export type RowDragState = { isActive: boolean, targetSelected: boolean };
export type RowMoveState = { draggingIndex: number | null, dropIndex: number | null };
export type ColumnWidths = Record<string, number>;
export type ResizeState = { field: string, startX: number, startWidth: number };
export type RowMovePayload = {
	fromIndex: number,
	toIndex: number,
	items: SearchItem[],
};

/**
 * Which container renders the rows. The controls around it — title, filters, pagination — are
 * the same either way; only the body between them is swapped.
 */
export type DataTableViewMode = 'list' | 'grid';

export const dataTableViewModes: readonly DataTableViewMode[] = ['list', 'grid'];

export function isDataTableViewMode(value: unknown): value is DataTableViewMode {
	return dataTableViewModes.includes(value as DataTableViewMode);
}
