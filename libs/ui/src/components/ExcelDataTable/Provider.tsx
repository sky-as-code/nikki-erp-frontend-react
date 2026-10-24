import React from 'react';

import { useRowCapabilities, withLeadingField } from './capabilities';
import { useColumnWidthsState } from './columnWidths';
import { ExcelDataTableContext } from './context';
import { restrictEditableFields } from './editModel';
import { useSchemaFieldNameTranslator } from './fieldLabels';
import { filterTreeToGraph } from './filter/filterGraph';
import { useApplyFilters, useFilterState } from './filter/useFilterState';
import { useManualSortDrag, useRowFeatures } from './rowFeatures';
import { useTableScope } from './tableScope';
import { excelDataTableTestIds } from './testIds';
import { useContainerWidthState, useIsCompact } from './useIsCompact';
import {
	useDiscardEditOnSelectionChange, useEditingState, useOpenState, useSearchRequestState, useSelectionState,
	useViewModeState,
} from './useProviderState';
import { useTranslate } from '../../i18n';

import type { ExcelDataTableRowFeatureProps, ExcelDataTableRowWriteProps } from './capabilities';
import type { EditingApi, ExcelDataTableContextValue, ScrollSyncRefs } from './context';
import type { FilterState } from './filter/useFilterState';
import type { ManualSortDrag } from './rowFeatures';
import type { SelectionMode } from './selectionModel';
import type { ColumnWidths, ExcelViewMode, RowId, SearchData, SearchItem } from './types';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type { FieldRendererMap } from '@nikkierp/viewengine/core';


export type ExcelDataTableProviderProps = ExcelDataTableRowWriteProps & ExcelDataTableRowFeatureProps & {
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
	/** Shown centred in a full-width row while the table has no rows; defaults to "No data". */
	emptyMessage?: string,
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
	/** Starting widths in px per field, ahead of the 200px default; the user may still resize. Read on mount. */
	initialColumnWidths?: ColumnWidths,
	children?: React.ReactNode,
};

const noopRefresh = () => undefined;
const emptyRenderers: FieldRendererMap = {};
const emptySchemas: Record<string, dyn.ModelSchema> = {};

/**
 * The first request carries the seeded `initialGraph` conditions: they are shown as applied in the
 * panel, so the first page must already be filtered by them (a pre-filtered link, a default scope).
 */
function useSeededSearchRequest(
	props: ExcelDataTableProviderProps, filters: FilterState,
): dyn.RestSearchRequest | undefined {
	const [seeded] = React.useState(() => (
		props.initialGraph && props.initialSearchRequest && !props.initialSearchRequest.graph
			? { ...props.initialSearchRequest, graph: filterTreeToGraph(filters.tree, filters.orderBy) }
			: props.initialSearchRequest
	));
	return seeded;
}

export function ExcelDataTableProvider(props: ExcelDataTableProviderProps) {
	const { data, isLoading = false } = props;
	const filters = useFilterState({
		baseGraph: props.baseGraph,
		initialGraph: props.initialGraph ?? props.initialSearchRequest?.graph,
		fallbackOrderBy: props.orderBy,
	});
	const { searchRequest, setSearchRequest } = useSearchRequestState(
		data, useSeededSearchRequest(props, filters), props.onSearchRequestChange, props.pageSize,
	);
	const applyFilters = useApplyFilters(filters, setSearchRequest);
	const editing = useEditingState(isLoading);
	const drag = useManualSortDrag();
	const selection = useTableSelection(props, editing, drag);
	const emptyMessage = useEmptyMessage(props.emptyMessage);
	const scopeId = useTableScope(editing.isActive, selection);
	const { viewMode, setViewMode } = useViewModeState(props.initialViewMode, props.allowedViewModes);
	const settings = useOpenState();
	const filterPane = useOpenState();
	const columnWidths = useColumnWidthsState(props.initialColumnWidths);
	const scrollSync = React.useRef<ScrollSyncRefs>({ header: null, body: null });
	const container = useContainerWidthState();
	const isCompact = useIsCompact(container.width);
	const tableName = props.tableName ?? props.modelSchema?.name ?? 'table';
	const modelSchema = useEditableSchema(props.modelSchema, props.editableFields);
	const tid = React.useMemo(() => excelDataTableTestIds(props.testId, tableName), [props.testId, tableName]);
	const schemaFieldName = useSchemaFieldNameTranslator(props.modelSchema, props.relatedSchemas ?? emptySchemas);
	const rows = useRowCapabilities(props, tableName);
	const fields = useDisplayedFields(data.desired_fields, props.newRowSearchField);
	const features = useRowFeatures(props, { data, fields, isLoading, rows, editing, searchRequest, drag, tableName });

	const value = React.useMemo<ExcelDataTableContextValue>(() => ({
		tableName,
		modelSchema,
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
		...features,
		// Table scope has no row editor: a double-click or Enter must not open one.
		canUpdateRows: rows.canUpdateRows && rows.updateScope === 'row',
		refresh: props.onRefresh ?? noopRefresh,
		translationNs: props.translationNs,
		translateFieldName: props.translateFieldName ?? schemaFieldName,
		buildLinkHref: props.buildLinkHref,
		fieldRenderers: props.fieldRenderers ?? emptyRenderers,
		tid,
		scopeId,
		emptyMessage,
	}), [
		tableName, modelSchema, props.relatedSchemas, data, isLoading, isCompact, container.setWidth,
		searchRequest,
		setSearchRequest, filters, applyFilters, selection, editing, viewMode, setViewMode, settings,
		filterPane, fields, columnWidths, props.indexColumnVisible, props.updateCommand, rows, features,
		props.onRefresh,
		props.translationNs,
		props.translateFieldName, schemaFieldName, props.buildLinkHref, props.fieldRenderers, tid, scopeId,
		emptyMessage,
	]);

	return (
		<ExcelDataTableContext.Provider value={value}>
			{props.children}
		</ExcelDataTableContext.Provider>
	);
}

/** The schema the rows edit against: `editableFields`, when given, is all an inline update offers. */
function useEditableSchema(modelSchema: dyn.ModelSchema | undefined, editableFields: string[] | undefined) {
	// Keyed by value, so a page passing a fresh array each render does not rebuild the schema.
	const key = editableFields?.join(',');
	return React.useMemo(() => restrictEditableFields(modelSchema, key?.split(',')), [modelSchema, key]);
}

/** The insert row and a handle drag both freeze selection; the drag cleared it when it started. */
function useTableSelection(props: ExcelDataTableProviderProps, editing: EditingApi, drag: ManualSortDrag) {
	const isFrozen = editing.creating || drag.activeId !== null;
	const selection = useSelectionState(props.data.items, props.onSelectionChange, isFrozen, {
		mode: props.selectionMode, initialSelectedIds: props.initialSelectedIds,
	});
	useDiscardEditOnSelectionChange(editing, selection.ids);
	return selection;
}

function useDisplayedFields(desiredFields: string[], newRowSearchField: string | undefined): string[] {
	return React.useMemo(
		() => withLeadingField(desiredFields, newRowSearchField), [desiredFields, newRowSearchField],
	);
}

function useEmptyMessage(message: string | undefined): string {
	const t = useTranslate('common');
	return message ?? t('messages.no.data', { defaultValue: 'No data' });
}
