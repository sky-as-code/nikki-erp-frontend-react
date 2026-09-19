import React from 'react';

import { useColumnWidthsState } from './columnWidths';
import { ExcelDataTableContext } from './context';
import { useApplyFilters, useFilterState } from './filter/useFilterState';
import { excelDataTableTestIds } from './testIds';
import { useContainerWidthState, useIsCompact } from './useIsCompact';
import {
	useEditingState, useOpenState, useSearchRequestState, useSelectionState, useViewModeState,
} from './useProviderState';

import type { ExcelDataTableContextValue, ScrollSyncRefs } from './context';
import type { ExcelViewMode, SearchData, SearchItem } from './types';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type { FieldRendererMap } from '@nikkierp/viewengine/core';


export type ExcelDataTableProviderProps = {
	/** Names the table in test ids (`ui.{tableName}`) when no `testId` is given. */
	tableName?: string,
	modelSchema?: dyn.ModelSchema,
	/** Schemas reached through an edge, keyed by schema name, for columns named `edge.field`. */
	relatedSchemas?: Record<string, dyn.ModelSchema>,
	data: SearchData,
	/** Drives the header's progress row and freezes an editing row until the load finishes. */
	isLoading?: boolean,
	initialSearchRequest?: dyn.RestSearchRequest,
	onSearchRequestChange?: (request: dyn.RestSearchRequest) => void,
	/** A page-authored graph seeded into the filter panel as editable conditions. */
	initialFilterGraph?: dyn.SearchGraph,
	orderBy?: dyn.OrderBy,
	initialViewMode?: ExcelViewMode,
	/** The command an inline row update publishes; inline editing is off when absent. */
	updateCommand?: string,
	/** Re-runs the current search; wired to the refresh action and to a saved inline update. */
	onRefresh?: () => void,
	onSelectionChange?: (selected: SearchItem[]) => void,
	translationNs?: string,
	translateFieldName?: (field: string) => string,
	buildLinkHref?: (item: SearchItem) => string,
	fieldRenderers?: FieldRendererMap,
	/** `{module}.{component}` prefix for every `data-testid` the table renders. */
	testId?: string,
	children?: React.ReactNode,
};

const noopRefresh = () => undefined;
const identity = (field: string) => field;
const emptyRenderers: FieldRendererMap = {};
const emptySchemas: Record<string, dyn.ModelSchema> = {};

export function ExcelDataTableProvider(props: ExcelDataTableProviderProps) {
	const { data, isLoading = false } = props;
	const { searchRequest, setSearchRequest } = useSearchRequestState(
		data, props.initialSearchRequest, props.onSearchRequestChange,
	);
	const filters = useFilterState({
		initialFilterGraph: props.initialFilterGraph,
		initialGraph: props.initialSearchRequest?.graph,
		fallbackOrderBy: props.orderBy,
	});
	const applyFilters = useApplyFilters(filters, setSearchRequest);
	const editing = useEditingState(isLoading);
	const selection = useSelectionState(data.items, props.onSelectionChange, editing.rowId !== null);
	const { viewMode, setViewMode } = useViewModeState(props.initialViewMode);
	const settings = useOpenState();
	const filterPane = useOpenState();
	const columnWidths = useColumnWidthsState(data.desired_fields);
	const scrollSync = React.useRef<ScrollSyncRefs>({ header: null, body: null });
	const container = useContainerWidthState();
	const isCompact = useIsCompact(container.width);
	const tableName = props.tableName ?? props.modelSchema?.name ?? 'table';
	const tid = React.useMemo(() => excelDataTableTestIds(props.testId, tableName), [props.testId, tableName]);

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
		fields: data.desired_fields,
		columnWidths,
		scrollSync,
		updateCommand: props.updateCommand,
		refresh: props.onRefresh ?? noopRefresh,
		translationNs: props.translationNs,
		translateFieldName: props.translateFieldName ?? identity,
		buildLinkHref: props.buildLinkHref,
		fieldRenderers: props.fieldRenderers ?? emptyRenderers,
		tid,
	}), [
		tableName, props.modelSchema, props.relatedSchemas, data, isLoading, isCompact, container.setWidth,
		searchRequest,
		setSearchRequest, filters, applyFilters, selection, editing, viewMode, setViewMode, settings,
		filterPane, columnWidths, props.updateCommand, props.onRefresh, props.translationNs,
		props.translateFieldName, props.buildLinkHref, props.fieldRenderers, tid,
	]);

	return (
		<ExcelDataTableContext.Provider value={value}>
			{props.children}
		</ExcelDataTableContext.Provider>
	);
}
