import React from 'react';

import { useRowCapabilities, withLeadingField } from './capabilities';
import { useColumnWidthsState } from './columnWidths';
import { ExcelDataTableContext } from './context';
import { useSchemaFieldNameTranslator } from './fieldLabels';
import { useApplyFilters, useFilterState } from './filter/useFilterState';
import { excelDataTableTestIds } from './testIds';
import { useContainerWidthState, useIsCompact } from './useIsCompact';
import {
	useDiscardEditOnSelectionChange, useEditingState, useOpenState, useSearchRequestState, useSelectionState,
	useViewModeState,
} from './useProviderState';

import type { ExcelDataTableRowWriteProps } from './capabilities';
import type { ExcelDataTableContextValue, ScrollSyncRefs } from './context';
import type { SelectionMode } from './selectionModel';
import type { ExcelViewMode, RowId, SearchData, SearchItem } from './types';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type { FieldRendererMap } from '@nikkierp/viewengine/core';


export type ExcelDataTableProviderProps = ExcelDataTableRowWriteProps & {
	/** Names the table in test ids (`ui.{tableName}`) when no `testId` is given. */
	tableName?: string,
	modelSchema?: dyn.ModelSchema,
	/** Schemas reached through an edge, keyed by schema name, for columns named `edge.field`. */
	relatedSchemas?: Record<string, dyn.ModelSchema>,
	data: SearchData,
	/** Drives the header's progress row and freezes an editing row until the load finishes. */
	isLoading?: boolean,
	initialSearchRequest?: dyn.RestSearchRequest,
	/** A fixed page size for the first request, ahead of the size the user last picked on any table. */
	pageSize?: number,
	onSearchRequestChange?: (request: dyn.RestSearchRequest) => void,
	/**
	 * A page-authored graph seeded into the filter panel as editable conditions and into the sort
	 * pane as its order. An initiator: the user may change or remove any of it.
	 */
	initialGraph?: dyn.SearchGraph,
	/**
	 * The locked scoping graph the search hook ANDs into every request, shown in the panel above
	 * the editable conditions so the user can see the scope without being able to widen it.
	 */
	baseGraph?: dyn.SearchGraph,
	orderBy?: dyn.OrderBy,
	initialViewMode?: ExcelViewMode,
	/**
	 * The modes this table offers. A remembered mode outside the list falls back to
	 * `initialViewMode`, so a mode a page has since dropped cannot leave the body blank.
	 */
	allowedViewModes?: ExcelViewMode[],
	/** Re-runs the current search; wired to the refresh action and to a saved inline update. */
	onRefresh?: () => void,
	onSelectionChange?: (selected: SearchItem[]) => void,
	/** `single` clamps every selection gesture to one row; defaults to `multiple`. */
	selectionMode?: SelectionMode,
	/** Off to hide the row-number column and its select-all; defaults to shown. */
	indexColumnVisible?: boolean,
	/** Rows selected once the first page loads, e.g. a picker's current value. Read on mount only. */
	initialSelectedIds?: RowId[],
	translationNs?: string,
	/** Defaults to the field's schema label, `$ref` resolved against the module owning the schema. */
	translateFieldName?: (field: string) => string,
	buildLinkHref?: (item: SearchItem) => string,
	fieldRenderers?: FieldRendererMap,
	/** `{module}.{component}` prefix for every `data-testid` the table renders. */
	testId?: string,
	children?: React.ReactNode,
};

const noopRefresh = () => undefined;
const emptyRenderers: FieldRendererMap = {};
const emptySchemas: Record<string, dyn.ModelSchema> = {};

export function ExcelDataTableProvider(props: ExcelDataTableProviderProps) {
	const { data, isLoading = false } = props;
	const { searchRequest, setSearchRequest } = useSearchRequestState(
		data, props.initialSearchRequest, props.onSearchRequestChange, props.pageSize,
	);
	const filters = useFilterState({
		baseGraph: props.baseGraph,
		initialGraph: props.initialGraph ?? props.initialSearchRequest?.graph,
		fallbackOrderBy: props.orderBy,
	});
	const applyFilters = useApplyFilters(filters, setSearchRequest);
	const editing = useEditingState(isLoading);
	const selection = useSelectionState(data.items, props.onSelectionChange, editing.creating, {
		mode: props.selectionMode, initialSelectedIds: props.initialSelectedIds,
	});
	useDiscardEditOnSelectionChange(editing, selection.ids);
	const { viewMode, setViewMode } = useViewModeState(props.initialViewMode, props.allowedViewModes);
	const settings = useOpenState();
	const filterPane = useOpenState();
	const columnWidths = useColumnWidthsState(data.desired_fields);
	const scrollSync = React.useRef<ScrollSyncRefs>({ header: null, body: null });
	const container = useContainerWidthState();
	const isCompact = useIsCompact(container.width);
	const tableName = props.tableName ?? props.modelSchema?.name ?? 'table';
	const tid = React.useMemo(() => excelDataTableTestIds(props.testId, tableName), [props.testId, tableName]);
	const schemaFieldName = useSchemaFieldNameTranslator(props.modelSchema, props.relatedSchemas ?? emptySchemas);
	const rows = useRowCapabilities(props, tableName);
	const { newRowSearchField } = props;
	const fields = React.useMemo(
		() => withLeadingField(data.desired_fields, newRowSearchField), [data.desired_fields, newRowSearchField],
	);

	const value = React.useMemo<ExcelDataTableContextValue>(() => ({
		tableName,
		modelSchema: props.modelSchema,
		relatedSchemas: props.relatedSchemas ?? emptySchemas,
		data,
		isLoading,
		isCompact,
		setContainerWidth: container.setWidth,
		searchRequest,
		setSearchRequest,
		filters,
		applyFilters,
		selection,
		editing,
		viewMode,
		setViewMode,
		settings,
		filterPane,
		indexColumnVisible: props.indexColumnVisible ?? true,
		fields,
		columnWidths,
		scrollSync,
		updateCommand: props.updateCommand,
		...rows,
		refresh: props.onRefresh ?? noopRefresh,
		translationNs: props.translationNs,
		translateFieldName: props.translateFieldName ?? schemaFieldName,
		buildLinkHref: props.buildLinkHref,
		fieldRenderers: props.fieldRenderers ?? emptyRenderers,
		tid,
	}), [
		tableName, props.modelSchema, props.relatedSchemas, data, isLoading, isCompact, container.setWidth,
		searchRequest,
		setSearchRequest, filters, applyFilters, selection, editing, viewMode, setViewMode, settings,
		filterPane, fields, columnWidths, props.indexColumnVisible, props.updateCommand, rows, props.onRefresh,
		props.translationNs,
		props.translateFieldName, schemaFieldName, props.buildLinkHref, props.fieldRenderers, tid,
	]);

	return (
		<ExcelDataTableContext.Provider value={value}>
			{props.children}
		</ExcelDataTableContext.Provider>
	);
}
