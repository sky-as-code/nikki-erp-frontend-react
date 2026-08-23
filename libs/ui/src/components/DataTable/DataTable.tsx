import {
	Box, Button, Group, Modal, Radio, Select, Stack, Tabs, Text, TextInput,
} from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';

import { TranslatedFieldRenderer } from './cellRenderers';
import { getCellText } from './cellValues';
import { DataTableContext, useDataTableContext } from './DataTableContext';
import { FilterBox, FilterPanel, makeEmptyTree, useApplyFilters, useFilterState } from './FilterBox';
import { GridView } from './GridView';
import { defaultColumnWidth, getAutoColumnWidth, ListView, useColumnWidthsState } from './ListView';
import { Pagination } from './Pagination';
import { SettingsTable } from './SettingsTable';
import { dataTableTestIds } from './testIds';
import { Toolbar } from './Toolbar';
import { isDataTableViewMode } from './types';
import { useLocaleCollator, useTranslate } from '../../i18n';

import type { DataTableTestIds } from './testIds';
import type {
	DataTableViewMode, RowDragState, RowMovePayload, RowMoveState, RowSelection, SearchData,
	SearchItem,
} from './types';
import type { ThunkPackHookReturn } from '../../appState';
import type { FieldRendererMap } from '@nikkierp/viewengine/core';


export type DataTableAction = {
	label?: string,
	icon?: React.ReactNode,
	isSeparator?: boolean,
	supportMultiple?: boolean,
	requireSelection?: boolean,
	/* If set, use this value instead of `href` */
	actionHook?: () => ThunkPackHookReturn<any, any>,
	/** Command name published (with the selected rows) when the action is triggered. */
	command?: string,
	/** Invoked on click with the currently selected row items. Preferred over `actionHook`. */
	onTrigger?: (selectedItems: Record<string, unknown>[]) => void,
	href?: string,
	/** Last segment of this action's `data-testid`. Defaults to `command`, then `label`. */
	testId?: string,
};

export type { FieldRendererMap, IFieldRenderer } from '@nikkierp/viewengine/core';

const storagePrerix = `ui:${DataTable.name}`;
const allowedPageSizes = [50, 100, 200] as const;
type AllowedPageSize = (typeof allowedPageSizes)[number];
const pageSizeSelectData = allowedPageSizes.map(n => ({ value: String(n), label: String(n) }));
const defaultViewMode: DataTableViewMode = 'list';
const defaultGridColumns = { base: 1, xs: 2, sm: 3, md: 4, lg: 5 };

export type RenderTableNameArgs = { name: string, total: number };
export type RenderTableNameFn = (args: RenderTableNameArgs) => React.ReactNode;

export type DataTableProps = {
	tableName: string,
	data: SearchData,
	initialSearchRequest?: dyn.RestSearchRequest,
	onSearchRequestChange?: (request: dyn.RestSearchRequest) => void,
	fieldRenderer?: FieldRendererMap,
	/** When set, each row's cells are linked with this absolute pathname (same href for all cells in the row). */
	buildLinkHref?: (rowData: SearchItem) => string,
	/**
	 * Fired on a plain unmodified left click on a row, instead of navigating.
	 *
	 * Where `buildLinkHref` is also set, ctrl/cmd/shift+click and right-click ("open in new tab")
	 * still navigate via the underlying link — only the plain click is intercepted, so a row can be
	 * both a pick target and a real link.
	 */
	onSelectRow?: (rowData: SearchItem) => void,
	/**
	 * The `id` of the row to show as picked. Renders the marked state for a caller that commits a
	 * choice separately (a picker with its own Apply), where `onSelectRow` only stages it.
	 */
	selectedRowId?: string,
	actions?: DataTableAction[],
	allowColumnResizing?: boolean,
	isFullWidthTable?: boolean,
	allowRowMovement?: boolean,
	onRowMoved?: (payload: RowMovePayload) => void,
	showControls?: boolean,
	enableSearchBox?: boolean,
	/** Renders the per-column filter row beneath the header. Needs `modelSchema` to infer inputs. */
	enableColumnFilters?: boolean,
	hasFixHeader?: boolean,
	renderTableName?: RenderTableNameFn,
	modelSchema?: dyn.ModelSchema,
	/**
	 * A page-authored graph seeded into the filter panel as **editable** conditions.
	 *
	 * For list pages, whose `filterGraph` is a default the user may reasonably widen or drop.
	 * Scoping that must hold — an embedded table's parent-record condition — is not passed here;
	 * it goes to `useResourceSearch`'s `baseGraph`, outside the user's reach.
	 */
	initialFilterGraph?: dyn.SearchGraph,
	orderBy?: dyn.OrderBy,
	sortableFields?: string[],
	translationNs?: string,
	translateFieldName?: (field: string) => string,
	/**
	 * Which container the rows are shown in when the user has not chosen one on this page.
	 *
	 * A page whose records are inherently visual — products, media — can open in `grid`; the
	 * setting the user picks afterwards is remembered per page and takes precedence.
	 */
	defaultViewMode?: DataTableViewMode,
	/** Off for tables whose records have nothing to show as a card; the setting is then hidden. */
	enableGridView?: boolean,
	/** Card columns per breakpoint, passed through to `SimpleGrid`. */
	gridColumns?: Record<string, number> | number,
	/** The field holding each card's picture. Inferred from the record when omitted. */
	gridThumbnailField?: string,
	/** `{module}.{component}` prefix for the `data-testid` of every element this table renders. */
	testId?: string,
};

export type RequiredDataTableProps = Omit<
	DataTableProps,
	'actions' | 'allowColumnResizing' | 'isFullWidthTable'
	| 'allowRowMovement' | 'showControls' | 'hasFixHeader' | 'translationNs' | 'translateFieldName'
	| 'enableGridView' | 'gridColumns'
> & {
	actions: DataTableAction[],
	allowColumnResizing: boolean,
	isFullWidthTable: boolean,
	allowRowMovement: boolean,
	showControls: boolean,
	enableSearchBox: boolean,
	enableColumnFilters: boolean,
	hasFixHeader: boolean,
	translationNs: string,
	translateFieldName: (field: string) => string,
	enableGridView: boolean,
	gridColumns: Record<string, number> | number,
};


export function DataTable(props: DataTableProps): React.ReactNode {
	const settings = withDataTableDefaults(props);
	const [isViewSettingsOpen, setIsViewSettingsOpen] = React.useState(false);
	const [isFilterPaneOpen, setIsFilterPaneOpen] = React.useState(false);
	const [searchRequest, setSearchRequest] = React.useState<dyn.RestSearchRequest>(() =>
		buildInitialSearchRequest(settings.data, settings.initialSearchRequest));
	const [viewMode, setViewMode] = React.useState<DataTableViewMode>(
		() => readStoredViewMode() ?? props.defaultViewMode ?? defaultViewMode);
	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const rs = useRowSelectionState(settings.data.items.length);
	const cw = useColumnWidthsState(settings.data.desired_fields);
	const rowMove = useRowMoveState(
		settings.data.items,
		settings.allowRowMovement,
		settings.onRowMoved,
		({ fromIndex, toIndex }) => {
			rs.setRows(prev => remapMovedRowSelection(prev, fromIndex, toIndex));
			rs.setAnchor(prev => remapMovedAnchor(prev, fromIndex, toIndex));
		},
	);
	const tableSearchData = React.useMemo(
		() => ({ ...settings.data, items: rowMove.items }),
		[rowMove.items, settings.data],
	);
	const isRowMode = rs.indexes.length > 0;
	const handlers = useTableHandlers({
		searchData: tableSearchData,
		cw,
		rs,
		containerRef,
	});
	const tableStyle: React.CSSProperties = { width: '100%', tableLayout: 'fixed' };
	const tid = useDataTableTestIds(settings.testId, settings.tableName);
	const filters = useFilterState({
		initialFilterGraph: settings.initialFilterGraph,
		initialGraph: settings.initialSearchRequest?.graph,
		fallbackOrderBy: settings.orderBy,
	});
	const applyFilters = useApplyFilters(filters, setSearchRequest);
	// A table that cannot show cards must never be stuck in `grid` — a stored preference from a
	// page that allowed it would otherwise leave this one with an empty body.
	const effectiveViewMode: DataTableViewMode = settings.enableGridView ? viewMode : 'list';

	React.useEffect(() => {
		setSearchRequest(prev => {
			if (prev.size !== settings.data.size) {
				return prev;
			}
			if (prev.page === settings.data.page) {
				return prev;
			}
			return { ...prev, page: settings.data.page };
		});
	}, [settings.data.page, settings.data.size]);

	React.useEffect(() => {
		props.onSearchRequestChange?.(searchRequest);
	}, [props.onSearchRequestChange, searchRequest]);

	const contextValue = React.useMemo(() => ({
		settings, tableSearchData, rs, cw, isRowMode, rowMove, handlers, containerRef, tableStyle,
		isViewSettingsOpen,
		onOpenViewSettings: () => setIsViewSettingsOpen(true),
		onCloseViewSettings: () => setIsViewSettingsOpen(false),
		isFilterPaneOpen,
		onToggleFilterPane: () => setIsFilterPaneOpen(prev => !prev),
		searchRequest, setSearchRequest, filters, applyFilters, tid,
		viewMode: effectiveViewMode, setViewMode,
	}), [
		settings, tableSearchData, rs, cw, isRowMode, rowMove, handlers, containerRef, tableStyle,
		isViewSettingsOpen, isFilterPaneOpen, searchRequest, filters, applyFilters, tid,
		effectiveViewMode,
	]);

	return (
		<DataTableContext.Provider value={contextValue}>
			<DataTableLayout />
		</DataTableContext.Provider>
	);
}

function useDataTableTestIds(testId: string | undefined, tableName: string): DataTableTestIds {
	return React.useMemo(() => dataTableTestIds(testId, tableName), [testId, tableName]);
}

function DataTableLayout(): React.ReactNode {
	const context = useDataTableContext();
	return (
		<Stack gap='xs' className='flex-1 basis-0' style={{ minWidth: 0 }}>
			{context.settings.showControls ? (
				<DataTableControls
					selectedCount={context.rs.indexes.length}
					onClearSelection={() => clearRowSelection(context.rs)}
				/>
			) : null}
			{/* Between the controls and the table: expanding it pushes the rows down rather
			    than covering the ones being filtered. */}
			{context.settings.showControls && context.settings.enableSearchBox
				&& context.isFilterPaneOpen
				? <DataTableFilterPane />
				: null}
			{/* The one place the view mode is read: the controls above and below are the same
			    in either mode, so only the body between them is swapped. */}
			{context.viewMode === 'grid' ? <GridView /> : <ListView />}
			{context.settings.showControls ? (
				<ViewSettingsModal
					desiredFields={context.settings.data.desired_fields}
					modelSchema={context.settings.modelSchema}
					opened={context.isViewSettingsOpen}
					onClose={context.onCloseViewSettings}
				/>
			) : null}
		</Stack>
	);
}

function parseStoredPageSize(raw: string | null): AllowedPageSize | null {
	if (!raw) {
		return null;
	}
	const n = Number(raw);
	return allowedPageSizes.includes(n as AllowedPageSize) ? (n as AllowedPageSize) : null;
}

function readStoredPageSize(): AllowedPageSize | null {
	if (typeof window === 'undefined') {
		return null;
	}
	const key = getPageSizeStorageKey();
	if (!key) {
		return null;
	}
	return parseStoredPageSize(window.localStorage.getItem(key));
}

/**
 * The view mode is remembered per page, unlike the page size, which is one global preference.
 *
 * List and grid suit different kinds of record, so a user who wants cards for products has said
 * nothing about how they want to see invoices.
 */
function getViewModeStorageKey(): string {
	return typeof window === 'undefined' ? '' : `${storagePrerix}:viewmode:${window.location.pathname}`;
}

function readStoredViewMode(): DataTableViewMode | null {
	if (typeof window === 'undefined') {
		return null;
	}
	const raw = window.localStorage.getItem(getViewModeStorageKey());
	return isDataTableViewMode(raw) ? raw : null;
}

function writeStoredViewMode(mode: DataTableViewMode): void {
	if (typeof window !== 'undefined') {
		window.localStorage.setItem(getViewModeStorageKey(), mode);
	}
}

function buildInitialSearchRequest(
	searchData: SearchData,
	initialRequest?: dyn.RestSearchRequest,
): dyn.RestSearchRequest {
	// The caller seeds a `size: 0` stub so the first round-trip resolves locally without an HTTP
	// call; this is where the table turns it into the first real request. A zero must therefore
	// fall through to the default page size, otherwise no search is ever sent.
	const storedSize = readStoredPageSize();
	const size = storedSize || initialRequest?.size || searchData.size || allowedPageSizes[0];
	return {
		...(initialRequest ?? {}),
		page: searchData.page,
		size,
	};
}

function withDataTableDefaults(props: DataTableProps): RequiredDataTableProps {
	return {
		...props,
		actions: props.actions ?? [],
		allowColumnResizing: props.allowColumnResizing ?? false,
		isFullWidthTable: props.isFullWidthTable ?? false,
		allowRowMovement: props.allowRowMovement ?? false,
		showControls: props.showControls ?? true,
		enableSearchBox: props.enableSearchBox ?? true,
		// Off without a schema: the inputs are inferred from field data types, and every column
		// would fall back to `unsupported` and render an empty row.
		enableColumnFilters: props.enableColumnFilters ?? props.modelSchema != null,
		hasFixHeader: props.hasFixHeader ?? false,
		translationNs: props.translationNs ?? 'common',
		translateFieldName: props.translateFieldName ?? (field => field),
		enableGridView: props.enableGridView ?? true,
		gridColumns: props.gridColumns ?? defaultGridColumns,
	};
}

/** Parses 1-based page shown in the UI; returns 0-based index for the API, or null if invalid. */
type DataTableControlsProps = {
	selectedCount: number,
	onClearSelection: () => void,
};

function DataTableControls(props: DataTableControlsProps): React.ReactNode {
	const context = useDataTableContext();
	const { filters } = context;
	return (
		<Group justify='space-between' className='px-4'>
			<Toolbar
				tableName={context.settings.tableName}
				total={context.tableSearchData.total}
				actions={context.settings.actions}
				selectedCount={props.selectedCount}
				onClearSelection={props.onClearSelection}
				renderTableName={context.settings.renderTableName}
			/>
			{context.settings.enableSearchBox ? (
				<FilterBox
					activeCount={filters.activeCount}
					expanded={context.isFilterPaneOpen}
					onToggle={context.onToggleFilterPane}
					tid={context.tid}
				/>
			) : null}
			<Pagination />
		</Group>
	);
}

/**
 * The expanded filter pane, in the flow between the controls row and the table.
 *
 * It reads the same `filters` state the trigger's badge counts, so what the pane shows and what
 * the button reports can never disagree.
 */
function DataTableFilterPane(): React.ReactNode {
	const context = useDataTableContext();
	const { filters, applyFilters } = context;
	const onClear = React.useCallback(() => {
		filters.clearAll();
		applyFilters({ tree: makeEmptyTree(), orderBy: [] });
	}, [filters, applyFilters]);
	return (
		<FilterPanel
			modelSchema={context.settings.modelSchema}
			tree={filters.tree}
			onTreeChange={filters.setTree}
			orderBy={filters.orderBy}
			onOrderByChange={filters.setOrderBy}
			sortableFields={context.settings.sortableFields}
			lossy={filters.lossy}
			includeArchived={filters.includeArchived}
			onIncludeArchivedChange={filters.setIncludeArchived}
			onApply={applyFilters}
			onClear={onClear}
			translateFieldName={context.settings.translateFieldName}
			tid={context.tid}
		/>
	);
}

function getPageSizeStorageKey(): string {
	return typeof window === 'undefined' ? '' : `${storagePrerix}:pagesize`;
}

function clearRowSelection(
	rs: ReturnType<typeof useRowSelectionState>,
): void {
	rs.setRows({});
	rs.setAnchor(null);
}

function clearRows(rs: ReturnType<typeof useRowSelectionState>): void {
	rs.setRows({});
	rs.setAnchor(null);
	rs.setDrag({ isActive: false, targetSelected: false });
}

function moveRow(items: SearchItem[], fromIndex: number, toIndex: number): SearchItem[] {
	if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
		return items;
	}
	const next = [...items];
	const [moved] = next.splice(fromIndex, 1);
	next.splice(toIndex, 0, moved);
	return next;
}

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function buildClipboardPayload(rows: string[][]) {
	const plainText = rows.map(row => row.join('\t')).join('\n');
	const htmlRows = rows.map(row => `<tr>${row.map(c => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`);
	return { plainText, htmlText: `<table><tbody>${htmlRows.join('')}</tbody></table>` };
}

async function copyToClipboard(rows: string[][]): Promise<void> {
	if (rows.length === 0) {
		return;
	}
	const { plainText, htmlText } = buildClipboardPayload(rows);
	try {
		if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
			await navigator.clipboard.write([new ClipboardItem({
				'text/plain': new Blob([plainText], { type: 'text/plain' }),
				'text/html': new Blob([htmlText], { type: 'text/html' }),
			})]);
			return;
		}
	}
	catch { /* fallback below */ }
	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(plainText);
	}
}

function rowsFromRowSelection(searchData: SearchData, rowIndexes: number[]): string[][] {
	return rowIndexes.map(idx => searchData.desired_fields.map(field =>
		getCellText(searchData.items[idx], field, searchData.masked_fields),
	));
}

function buildRangeRowSelection(from: number, to: number): RowSelection {
	const next: RowSelection = {};
	const start = Math.min(from, to);
	const end = Math.max(from, to);
	for (let i = start; i <= end; i += 1) {
		next[i] = true;
	}
	return next;
}

function buildAllRowSelection(count: number): RowSelection {
	const next: RowSelection = {};
	for (let i = 0; i < count; i += 1) {
		next[i] = true;
	}
	return next;
}

function remapMovedRowIndex(index: number, fromIndex: number, toIndex: number): number {
	if (index === fromIndex) {
		return toIndex;
	}
	if (fromIndex < toIndex && index > fromIndex && index <= toIndex) {
		return index - 1;
	}
	if (fromIndex > toIndex && index >= toIndex && index < fromIndex) {
		return index + 1;
	}
	return index;
}

function remapMovedRowSelection(rows: RowSelection, fromIndex: number, toIndex: number): RowSelection {
	const next: RowSelection = {};
	for (const [index, isSelected] of Object.entries(rows)) {
		if (!isSelected) {
			continue;
		}
		const mappedIndex = remapMovedRowIndex(Number(index), fromIndex, toIndex);
		next[mappedIndex] = true;
	}
	return next;
}

function remapMovedAnchor(anchor: number | null, fromIndex: number, toIndex: number): number | null {
	if (anchor === null) {
		return anchor;
	}
	return remapMovedRowIndex(anchor, fromIndex, toIndex);
}

export function useRowSelectionState(rowCount: number) {
	const [rows, setRows] = React.useState<RowSelection>({});
	const [anchor, setAnchor] = React.useState<number | null>(null);
	const [drag, setDrag] = React.useState<RowDragState>({ isActive: false, targetSelected: false });

	React.useEffect(() => {
		setRows({});
		setAnchor(null);
		setDrag({ isActive: false, targetSelected: false });
	}, [rowCount]);

	React.useEffect(() => {
		if (!drag.isActive) {
			return undefined;
		}
		const onUp = () => setDrag(d => ({ ...d, isActive: false }));
		window.addEventListener('mouseup', onUp);
		return () => window.removeEventListener('mouseup', onUp);
	}, [drag.isActive]);

	const indexes = React.useMemo(
		() => Object.keys(rows).filter(k => rows[Number(k)]).map(Number).sort((a, b) => a - b),
		[rows],
	);
	return { rows, setRows, anchor, setAnchor, drag, setDrag, indexes };
}

export function useRowMoveState(
	inputItems: SearchItem[],
	enabled: boolean,
	onRowMoved?: (payload: RowMovePayload) => void,
	onRowsReordered?: (payload: Pick<RowMovePayload, 'fromIndex' | 'toIndex'>) => void,
) {
	const [items, setItems] = React.useState<SearchItem[]>(inputItems);
	const [state, setState] = React.useState<RowMoveState>({ draggingIndex: null, dropIndex: null });

	React.useEffect(() => {
		setItems(inputItems);
		setState({ draggingIndex: null, dropIndex: null });
	}, [inputItems]);

	const startDragging = React.useCallback((index: number) => {
		if (enabled) {
			setState({ draggingIndex: index, dropIndex: index });
		}
	}, [enabled]);

	const dragOver = React.useCallback((index: number) => {
		if (enabled) {
			setState(prev => ({ ...prev, dropIndex: index }));
		}
	}, [enabled]);

	const drop = React.useCallback((targetIndex: number) => {
		const fromIndex = state.draggingIndex ?? -1;
		const next = enabled ? moveRow(items, fromIndex, targetIndex) : items;
		setItems(next);
		if (enabled && fromIndex >= 0 && fromIndex !== targetIndex) {
			onRowsReordered?.({ fromIndex, toIndex: targetIndex });
			onRowMoved?.({ fromIndex, toIndex: targetIndex, items: next });
		}
		setState({ draggingIndex: null, dropIndex: null });
	}, [enabled, items, onRowMoved, onRowsReordered, state.draggingIndex]);

	const cancel = React.useCallback(() => {
		setState({ draggingIndex: null, dropIndex: null });
	}, []);

	return { items, state, startDragging, dragOver, drop, cancel };
}

type ViewSettingsModalProps = {
	opened: boolean,
	onClose: () => void,
	modelSchema?: dyn.ModelSchema,
	desiredFields: string[],
};

function TableSettingsPanel(props: {
	draftPageSize: string,
	onDraftPageSizeChange: (value: string) => void,
	draftViewMode: DataTableViewMode,
	onDraftViewModeChange: (value: string) => void,
	enableGridView: boolean,
}): React.ReactNode {
	const t = useTranslate('common');
	const { tid } = useDataTableContext();
	return (
		<Stack gap='md'>
			<Stack gap='xs'>
				<Text size='sm' fw={500}>{t('datatable.pageSize')}</Text>
				<Select
					allowDeselect={false}
					data={pageSizeSelectData}
					onChange={value => {
						if (value) {
							props.onDraftPageSizeChange(value);
						}
					}}
					value={props.draftPageSize}
					{...tid.settingsPageSize()}
				/>
			</Stack>
			{props.enableGridView ? (
				<Stack gap='xs'>
					<Text size='sm' fw={500}>{t('datatable.viewMode')}</Text>
					<Radio.Group onChange={props.onDraftViewModeChange} value={props.draftViewMode}>
						<Stack gap='xs'>
							<Radio value='list' label={t('datatable.list')} {...tid.settingsViewMode('list')} />
							<Radio value='grid' label={t('datatable.grid')} {...tid.settingsViewMode('grid')} />
						</Stack>
					</Radio.Group>
				</Stack>
			) : null}
		</Stack>
	);
}

type ViewSettingsModalViewProps = {
	opened: boolean,
	onClose: () => void,
	activeTab: string | null,
	onActiveTabChange: (value: string | null) => void,
	fieldSearch: string,
	onFieldSearchChange: (value: string) => void,
	selectableFields: string[],
	hasExplicitFieldOrder: boolean,
	fieldsPanelNonce: number,
	fieldsSelectionGetterRef: React.RefObject<(() => string[]) | null>,
	initialSelectedFieldNames: string[],
	translationNs: string,
	draftPageSize: string,
	onDraftPageSizeChange: (value: string) => void,
	draftViewMode: DataTableViewMode,
	onDraftViewModeChange: (value: string) => void,
	enableGridView: boolean,
	onApply: () => void,
};

function ViewSettingsModalView(props: ViewSettingsModalViewProps): React.ReactNode {
	const t = useTranslate('common');
	const { tid } = useDataTableContext();

	const modalStyles = {
		body: { width: '400px' },
		title: { fontWeight: 'bold' as const },
	};
	return (
		<Modal
			onClose={props.onClose}
			opened={props.opened}
			size='auto'
			styles={modalStyles}
			title={t('datatable.viewSettings')}
		>
			<Stack h='100%'>
				<Tabs onChange={props.onActiveTabChange} style={{ flex: 1, overflow: 'auto' }} value={props.activeTab}>
					<Tabs.List>
						<Tabs.Tab value='fields-settings' className='capitalize' {...tid.settingsTab('fields')}>
							{t('datatable.fields')}
						</Tabs.Tab>
						<Tabs.Tab value='table-settings' className='capitalize' {...tid.settingsTab('view')}>
							{t('datatable.view')}
						</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel pt='sm' value='fields-settings'>
						<TextInput
							onChange={event => props.onFieldSearchChange(event.currentTarget.value)}
							placeholder={t('datatable.fieldFilterPlaceholder')}
							value={props.fieldSearch}
							{...tid.settingsFieldSearch()}
						/>
						<FieldsSettingsTable
							fields={props.selectableFields}
							fieldSearch={props.fieldSearch}
							fieldsPanelNonce={props.fieldsPanelNonce}
							hasExplicitFieldOrder={props.hasExplicitFieldOrder}
							initialSelectedFieldNames={props.initialSelectedFieldNames}
							selectionGetterRef={props.fieldsSelectionGetterRef}
							translationNs={props.translationNs}
						/>
					</Tabs.Panel>
					<Tabs.Panel pt='sm' value='table-settings'>
						<TableSettingsPanel
							draftPageSize={props.draftPageSize}
							draftViewMode={props.draftViewMode}
							enableGridView={props.enableGridView}
							onDraftPageSizeChange={props.onDraftPageSizeChange}
							onDraftViewModeChange={props.onDraftViewModeChange}
						/>
					</Tabs.Panel>
				</Tabs>
				<Box className='border-t border-gray-300 mt-auto pt-3'>
					<Group justify='flex-end'>
						<Button onClick={props.onClose} variant='default' {...tid.settingsCancel()}>
							{t('action.cancel')}
						</Button>
						<Button onClick={props.onApply} {...tid.settingsApply()}>{t('action.apply')}</Button>
					</Group>
				</Box>
			</Stack>
		</Modal>
	);
}

function ViewSettingsModal(props: ViewSettingsModalProps): React.ReactNode {
	const { opened, onClose, modelSchema, desiredFields } = props;
	const context = useDataTableContext();
	const { searchRequest, setSearchRequest, viewMode, setViewMode } = context;
	const [activeTab, setActiveTab] = React.useState<string | null>('fields-settings');
	const [fieldSearch, setFieldSearch] = React.useState('');
	const [draftPageSize, setDraftPageSize] = React.useState(String(allowedPageSizes[0]));
	const { draftViewMode, onDraftViewModeChange } = useDraftViewMode(opened, viewMode);
	const fieldsSelectionGetterRef = React.useRef<(() => string[]) | null>(null);
	const [fieldsPanelNonce, setFieldsPanelNonce] = React.useState(0);
	const allSelectableFields = React.useMemo(
		() => (modelSchema ? getSelectableSchemaFieldNames(modelSchema) : [...desiredFields]),
		[desiredFields, modelSchema],
	);
	React.useLayoutEffect(() => {
		if (!opened) {
			return;
		}
		setFieldsPanelNonce(n => n + 1);
	}, [opened]);

	React.useEffect(() => {
		if (!opened) {
			return;
		}
		const raw = searchRequest.size;
		const newSize = allowedPageSizes.includes(raw as AllowedPageSize) ? raw : allowedPageSizes[0];
		setDraftPageSize(String(newSize));
	}, [opened, searchRequest.size]);

	const applyViewSettings = React.useCallback(() => {
		const parsed = Number(draftPageSize);
		const size = allowedPageSizes.includes(parsed as AllowedPageSize)
			? (parsed as AllowedPageSize)
			: allowedPageSizes[0];
		const key = getPageSizeStorageKey();
		if (typeof window !== 'undefined' && key) {
			window.localStorage.setItem(key, String(size));
		}
		setViewMode(draftViewMode);
		writeStoredViewMode(draftViewMode);
		const fieldOrder = fieldsSelectionGetterRef.current?.() ?? [];
		setSearchRequest(prev => ({
			...prev,
			fields: fieldOrder.length > 0 ? fieldOrder : undefined,
			page: 0,
			size,
		}));
		onClose();
	}, [draftPageSize, draftViewMode, onClose, setSearchRequest, setViewMode]);

	return (
		<ViewSettingsModalView
			activeTab={activeTab}
			draftPageSize={draftPageSize}
			draftViewMode={draftViewMode}
			enableGridView={context.settings.enableGridView}
			fieldSearch={fieldSearch}
			fieldsPanelNonce={fieldsPanelNonce}
			fieldsSelectionGetterRef={fieldsSelectionGetterRef}
			selectableFields={allSelectableFields}
			hasExplicitFieldOrder={(searchRequest.fields?.length ?? 0) > 0}
			initialSelectedFieldNames={desiredFields}
			opened={opened}
			translationNs={context.settings.translationNs}
			onActiveTabChange={setActiveTab}
			onApply={applyViewSettings}
			onClose={onClose}
			onDraftPageSizeChange={setDraftPageSize}
			onDraftViewModeChange={onDraftViewModeChange}
			onFieldSearchChange={setFieldSearch}
		/>
	);
}

/**
 * The view-mode radio's draft value.
 *
 * The radio is a draft until Apply, like every other setting in this modal: opening it and
 * cancelling must leave the view the user was looking at untouched. Reseeding on open — rather
 * than only on mount — also covers the mode being changed elsewhere between two openings.
 */
function useDraftViewMode(opened: boolean, viewMode: DataTableViewMode) {
	const [draftViewMode, setDraftViewMode] = React.useState<DataTableViewMode>(viewMode);

	React.useEffect(() => {
		if (opened) {
			setDraftViewMode(viewMode);
		}
	}, [opened, viewMode]);

	const onDraftViewModeChange = React.useCallback((value: string) => {
		if (isDataTableViewMode(value)) {
			setDraftViewMode(value);
		}
	}, []);

	return { draftViewMode, onDraftViewModeChange };
}

const fieldsSettingsTableColumn = 'datatable.fields';

function FieldsSettingsTable(props: {
	fields: string[],
	fieldSearch: string,
	fieldsPanelNonce: number,
	hasExplicitFieldOrder: boolean,
	initialSelectedFieldNames: string[],
	selectionGetterRef: React.RefObject<(() => string[]) | null>,
	translationNs: string,
}): React.ReactNode {
	const t = useTranslate(props.translationNs);
	const compareLocalized = useLocaleCollator();
	const label = React.useCallback((field: string) => t(`fields.${field}`), [t]);

	// Filtered and sorted here rather than upstream because this is the only component holding
	// the same `t` that renders the rows, so the text matched and ordered is the text shown.
	//
	// An order the user arranged by dragging is left alone: it is saved on the request, and
	// re-sorting it alphabetically on reopen would silently discard their arrangement.
	const rows = React.useMemo(() => {
		const query = props.fieldSearch.trim().toLowerCase();
		const matched = query
			? props.fields.filter(field => field.toLowerCase().includes(query)
				|| label(field).toLowerCase().includes(query))
			: [...props.fields];
		if (props.hasExplicitFieldOrder) {
			return matched;
		}
		return matched.sort((a, b) => compareLocalized(label(a), label(b)));
	}, [props.fields, props.fieldSearch, props.hasExplicitFieldOrder, label, compareLocalized]);

	return (
		<div className='mt-2' key={props.fieldsPanelNonce}>
			<SettingsTable
				allowRowMovement
				data={createFieldsSearchData(rows)}
				initialSelectedValues={props.initialSelectedFieldNames}
				selectionGetterRef={props.selectionGetterRef}
				translateFieldName={field => t(field)}
				translationNs={props.translationNs}
				valueKey={fieldsSettingsTableColumn}
				fieldRenderer={{
					[fieldsSettingsTableColumn]: new TranslatedFieldRenderer('fields.'),
				}}
			/>
		</div>
	);
}

function createFieldsSearchData(fields: string[]): SearchData {
	const colLabel = fieldsSettingsTableColumn;
	const items = fields.map((field, index) => ({
		id: `${field}-${index}`,
		[colLabel]: field,
	}));

	return {
		page: 0,
		size: Math.max(fields.length, 1),
		total: fields.length,
		items,
		desired_fields: [colLabel],
		masked_fields: [],
		schema_etag: '',
	} as SearchData;
}

/**
 * The columns a user may choose from. Excludes the fields the server owns (keys and foreign
 * keys), the model-typed edges, which stand for a relation rather than a value, and anything
 * whose value is an opaque id. A computed field is deliberately kept: it is read-only, but it
 * carries the business meaning a user actually wants in a listing.
 *
 * Foreign keys are named explicitly even though `is_system_field` already covers the declared
 * ones, so the list does not depend on that coupling.
 */
function getSelectableSchemaFieldNames(schema: dyn.ModelSchema): string[] {
	return Object.values(schema.fields)
		.filter(field => !field.is_system_field && !field.is_edge_model && !field.is_foreign_key)
		.filter(field => !isOpaqueIdField(schema, field))
		.map(field => field.name);
}

/**
 * Whether the field's value is an id with nothing readable in it.
 *
 * The discriminator is the data type rather than computedness: a schema can declare a computed
 * field that copies a *peer's* id (a variant carrying its template's category id, say), which is
 * neither a foreign key nor a system field yet still renders as a raw ULID. The record label is
 * the one id worth showing, because that is what identifies the row.
 */
function isOpaqueIdField(schema: dyn.ModelSchema, field: dyn.ModelSchemaField): boolean {
	const typeName = typeof field.data_type === 'string' ? field.data_type : field.data_type?.name;
	return typeName === 'ulid' && field.name !== schema.record_label_field;
}


type TableHandlersArgs = {
	searchData: SearchData,
	cw: ReturnType<typeof useColumnWidthsState>,
	rs: ReturnType<typeof useRowSelectionState>,
	containerRef: React.RefObject<HTMLDivElement | null>,
};

export function useTableHandlers(args: TableHandlersArgs) {
	const onStartResize = useResizeHandler(args.cw);
	const onAutoResize = useAutoResizeHandler(args.searchData, args.cw, args.containerRef);
	const onToggleAll = useToggleAllHandler(args.searchData, args.rs);
	const onRowMouseDown = useRowMouseDownHandler(args.rs);
	const onRowMouseEnter = useRowMouseEnterHandler(args.rs);
	const onDataCellMouseDown = useDataCellMouseDownHandler(args.rs);
	const onKeyDown = useKeyDownHandler(args);
	return {
		onStartResize, onAutoResize, onToggleAll,
		onRowMouseDown, onRowMouseEnter, onDataCellMouseDown, onKeyDown,
	};
}

function useResizeHandler(cw: ReturnType<typeof useColumnWidthsState>) {
	return React.useCallback((field: string, event: React.MouseEvent<HTMLDivElement>) => {
		event.preventDefault();
		cw.setResizing({
			field, startX: event.clientX,
			startWidth: cw.widths[field] ?? defaultColumnWidth,
		});
	}, [cw]);
}

function useAutoResizeHandler(
	searchData: SearchData,
	cw: ReturnType<typeof useColumnWidthsState>,
	containerRef: React.RefObject<HTMLDivElement | null>,
) {
	return React.useCallback((field: string) => {
		const next = getAutoColumnWidth(field, searchData);
		cw.setWidths(prev => ({ ...prev, [field]: next }));
		containerRef.current?.focus();
	}, [containerRef, cw, searchData]);
}

function useToggleAllHandler(
	searchData: SearchData,
	rs: ReturnType<typeof useRowSelectionState>,
) {
	return React.useCallback(() => {
		if (rs.indexes.length > 0) {
			clearRows(rs);
			return;
		}
		rs.setRows(buildAllRowSelection(searchData.items.length));
		rs.setAnchor(0);
	}, [rs, searchData.items.length]);
}

function useRowMouseDownHandler(
	rs: ReturnType<typeof useRowSelectionState>,
) {
	return React.useCallback((
		event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>,
		rowIndex: number,
	) => {
		event.preventDefault();
		event.stopPropagation();
		if (event.shiftKey && rs.anchor !== null) {
			rs.setRows(buildRangeRowSelection(rs.anchor, rowIndex));
			return;
		}
		const next = !rs.rows[rowIndex];
		rs.setRows(prev => ({ ...prev, [rowIndex]: next }));
		rs.setAnchor(rowIndex);
		rs.setDrag({ isActive: true, targetSelected: next });
	}, [rs]);
}

function useDataCellMouseDownHandler(rs: ReturnType<typeof useRowSelectionState>) {
	return React.useCallback((
		event: React.MouseEvent<HTMLTableCellElement>,
		rowIndex: number,
	) => {
		rs.setRows({ [rowIndex]: true });
		rs.setAnchor(rowIndex);
		rs.setDrag({ isActive: false, targetSelected: false });
	}, [rs]);
}

function useRowMouseEnterHandler(rs: ReturnType<typeof useRowSelectionState>) {
	return React.useCallback((rowIndex: number) => {
		if (!rs.drag.isActive) {
			return;
		}
		rs.setRows(prev => ({ ...prev, [rowIndex]: rs.drag.targetSelected }));
	}, [rs]);
}

function useKeyDownHandler(args: TableHandlersArgs) {
	const { rs } = args;
	const handleCopy = useCopyHandler(args);
	const handleRowArrow = useRowArrowHandler(args);
	return React.useCallback(async (event: React.KeyboardEvent<HTMLDivElement>) => {
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
			await handleCopy();
			event.preventDefault();
			return;
		}
		if (rs.indexes.length === 1 && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
			handleRowArrow(event.key);
			event.preventDefault();
			return;
		}
	}, [
		handleCopy,
		handleRowArrow,
		rs.indexes,
	]);
}

function useCopyHandler({ searchData, rs }: TableHandlersArgs) {
	return React.useCallback(async () => {
		const rows = rowsFromRowSelection(searchData, rs.indexes);
		await copyToClipboard(rows);
	}, [rs.indexes, searchData]);
}

function useRowArrowHandler({ searchData, rs }: TableHandlersArgs) {
	return React.useCallback((key: string) => {
		const current = rs.indexes[0];
		const target = key === 'ArrowUp' ? current - 1 : current + 1;
		const safe = Math.max(0, Math.min(searchData.items.length - 1, target));
		rs.setRows({ [safe]: true });
		rs.setAnchor(safe);
	}, [rs, searchData.items.length]);
}
