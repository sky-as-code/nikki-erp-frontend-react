import React from 'react';

import type { useColumnWidthsState } from './columnWidths';
import type { FilterTree } from './filter/filterTree';
import type { FilterState } from './filter/useFilterState';
import type { SelectionModifiers, SelectionState } from './selectionModel';
import type { ExcelDataTableTestIds } from './testIds';
import type { ExcelViewMode, RowId, SearchData, SearchItem } from './types';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type { FieldRendererMap } from '@nikkierp/viewengine/core';


export type ScrollSyncRefs = { header: HTMLElement | null, body: HTMLElement | null };

export type SelectionApi = SelectionState & {
	/** The row-handle click with its modifier keys. */
	selectRow: (id: RowId, mods?: SelectionModifiers) => void,
	/** Arrow-key navigation; collapses a multi-selection to one row. */
	move: (delta: number) => void,
	clear: () => void,
	/** The rows currently displayed, in display order — the domain of every gesture. */
	order: RowId[],
	itemsById: Map<RowId, SearchItem>,
};

export type EditingApi = {
	rowId: RowId | null,
	start: (id: RowId) => void,
	stop: () => void,
};

export type OpenState = { isOpen: boolean, open: () => void, close: () => void, toggle: () => void };

/**
 * Everything the table's parts share. A Provider can sit at page level, so nothing here assumes
 * a DOM ancestor; layout-bound state (scroll position, widths) travels through refs and plain
 * state instead.
 */
export type ExcelDataTableContextValue = {
	tableName: string,
	modelSchema: dyn.ModelSchema | undefined,
	relatedSchemas: Record<string, dyn.ModelSchema>,
	data: SearchData,
	isLoading: boolean,
	isCompact: boolean,
	/**
	 * Reports the toolbar's measured width, so the compact switch follows the container rather than
	 * the viewport. Called by `Toolbar`, which owns the element being measured.
	 */
	setContainerWidth: (width: number | null) => void,
	searchRequest: dyn.RestSearchRequest,
	setSearchRequest: React.Dispatch<React.SetStateAction<dyn.RestSearchRequest>>,
	filters: FilterState,
	/** The one path by which conditions and sort order reach the request. */
	applyFilters: (overrides?: { tree?: FilterTree, orderBy?: dyn.OrderBy }) => void,
	selection: SelectionApi,
	editing: EditingApi,
	viewMode: ExcelViewMode,
	setViewMode: (mode: ExcelViewMode) => void,
	settings: OpenState,
	filterPane: OpenState,
	/** The displayed columns, in order; the header and the body render the same list. */
	fields: string[],
	columnWidths: ReturnType<typeof useColumnWidthsState>,
	/** The header mirrors the body's horizontal scroll; both register their scroll element here. */
	scrollSync: React.MutableRefObject<ScrollSyncRefs>,
	updateCommand: string | undefined,
	refresh: () => void,
	translationNs: string | undefined,
	translateFieldName: (field: string) => string,
	buildLinkHref: ((item: SearchItem) => string) | undefined,
	fieldRenderers: FieldRendererMap,
	tid: ExcelDataTableTestIds,
};

export const ExcelDataTableContext = React.createContext<ExcelDataTableContextValue | null>(null);

export function useExcelDataTableContext(): ExcelDataTableContextValue {
	const context = React.useContext(ExcelDataTableContext);
	if (!context) {
		throw new Error('ExcelDataTable context is not available; wrap the component in ExcelDataTable.Provider');
	}
	return context;
}
