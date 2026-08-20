import React from 'react';

import type {
	RequiredDataTableProps, SearchData, useColumnWidthsState, useRowMoveState,
	useRowSelectionState, useTableHandlers,
} from './DataTable';
import type { FilterTree } from './filterTree';
import type { DataTableTestIds } from './testIds';
import type { FilterState } from './useFilterState';
import type * as dyn from '@nikkierp/common/dynamicModel';


/**
 * Everything the table's parts share, in one object.
 *
 * It lives in its own module so the pieces that only *consume* it — the toolbar, the pagination
 * controls — can import it without importing `DataTable` itself, which imports them back. The
 * types it is built from still come from `DataTable`, but as `import type`: those are erased at
 * compile time, so no cycle survives to runtime.
 */
export type DataTableContextValue = {
	settings: RequiredDataTableProps,
	tableSearchData: SearchData,
	rs: ReturnType<typeof useRowSelectionState>,
	cw: ReturnType<typeof useColumnWidthsState>,
	isRowMode: boolean,
	rowMove: ReturnType<typeof useRowMoveState>,
	handlers: ReturnType<typeof useTableHandlers>,
	containerRef: React.RefObject<HTMLDivElement | null>,
	tableStyle: React.CSSProperties,
	isViewSettingsOpen: boolean,
	onOpenViewSettings: () => void,
	onCloseViewSettings: () => void,
	/** The filter pane's visibility, owned here because the trigger and the pane are siblings. */
	isFilterPaneOpen: boolean,
	onToggleFilterPane: () => void,
	searchRequest: dyn.RestSearchRequest,
	setSearchRequest: React.Dispatch<React.SetStateAction<dyn.RestSearchRequest>>,
	filters: FilterState,
	/** The one path by which conditions and sort order reach the request. */
	applyFilters: (overrides?: { tree?: FilterTree, orderBy?: dyn.OrderBy }) => void,
	tid: DataTableTestIds,
};

export const DataTableContext = React.createContext<DataTableContextValue | null>(null);

export function useDataTableContext(): DataTableContextValue {
	const context = React.useContext(DataTableContext);
	if (!context) {
		throw new Error('DataTable context is not available');
	}
	return context;
}
