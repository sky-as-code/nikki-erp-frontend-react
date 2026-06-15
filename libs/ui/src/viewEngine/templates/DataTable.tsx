import {
	Anchor, Box, Button, ButtonGroup, Group, Input, Menu, Modal, Radio, Select,
	Stack, Table, Tabs, Text, TextInput, Title,
} from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import {
	IconChevronLeft, IconChevronRight, IconDots, IconHash, IconSettings, IconX,
	IconSortAscending, IconSortDescending,
} from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { Link, useResolvedPath } from 'react-router-dom';

import classes from './DataTable.module.css';
import {
	FieldRendererMap,
	IFieldRenderer,
	renderDefaultByDataType,
	applyCustomRenderer,
	TranslatedFieldRenderer,
} from './fieldRenderers';
import { SearchBox } from './SearchBox';
import { SettingsTable } from './SettingsTable';
import { ThunkPackHookReturn } from '../../appState';
import { TranslateFn, useTranslate } from '../../i18n';


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
};

export type { FieldRendererMap, IFieldRenderer } from './fieldRenderers';

type SearchItem = Record<string, any>;
export type SearchData = dyn.RestSearchResponse<SearchItem>;

type RowSelection = Record<number, boolean>;
type RowDragState = { isActive: boolean, targetSelected: boolean };
type RowMoveState = { draggingIndex: number | null, dropIndex: number | null };
type ColumnWidths = Record<string, number>;
type ResizeState = { field: string, startX: number, startWidth: number };
type RowMovePayload = {
	fromIndex: number,
	toIndex: number,
	items: SearchItem[],
};

const rowNumberColumnWidth = 64;
const defaultColumnWidth = 200;
const minimumColumnWidth = 80;
const maximumAutoColumnWidth = 500;
const characterPixelWidth = 8;
const cellHorizontalPadding = 32;
const storagePrerix = `ui:${DataTable.name}`;
const allowedPageSizes = [50, 100, 200] as const;
type AllowedPageSize = (typeof allowedPageSizes)[number];
const pageSizeSelectData = allowedPageSizes.map(n => ({ value: String(n), label: String(n) }));

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
	actions?: DataTableAction[],
	allowColumnResizing?: boolean,
	isFullWidthTable?: boolean,
	allowRowMovement?: boolean,
	onRowMoved?: (payload: RowMovePayload) => void,
	showControls?: boolean,
	enableSearchBox?: boolean,
	hasFixHeader?: boolean,
	renderTableName?: RenderTableNameFn,
	modelSchema?: dyn.ModelSchema,
	orderBy?: dyn.OrderBy,
	sortableFields?: string[],
	translationNs?: string,
	translateFieldName?: (field: string) => string,
};

type RequiredDataTableProps = Omit<
	DataTableProps,
	'actions' | 'allowColumnResizing' | 'isFullWidthTable'
	| 'allowRowMovement' | 'showControls' | 'hasFixHeader' | 'translationNs' | 'translateFieldName'
> & {
	actions: DataTableAction[],
	allowColumnResizing: boolean,
	isFullWidthTable: boolean,
	allowRowMovement: boolean,
	showControls: boolean,
	enableSearchBox: boolean,
	hasFixHeader: boolean,
	translationNs: string,
	translateFieldName: (field: string) => string,
};

type DataTableContextValue = {
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
	searchRequest: dyn.RestSearchRequest,
	setSearchRequest: React.Dispatch<React.SetStateAction<dyn.RestSearchRequest>>,
};

const DataTableContext = React.createContext<DataTableContextValue | null>(null);

export function DataTable(props: DataTableProps): React.ReactNode {
	const settings = withDataTableDefaults(props);
	const [isViewSettingsOpen, setIsViewSettingsOpen] = React.useState(false);
	const [searchRequest, setSearchRequest] = React.useState<dyn.RestSearchRequest>(() =>
		buildInitialSearchRequest(settings.data, settings.initialSearchRequest));
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
		settings,
		tableSearchData,
		rs,
		cw,
		isRowMode,
		rowMove,
		handlers,
		containerRef,
		tableStyle,
		isViewSettingsOpen,
		onOpenViewSettings: () => setIsViewSettingsOpen(true),
		onCloseViewSettings: () => setIsViewSettingsOpen(false),
		searchRequest,
		setSearchRequest,
	}), [
		settings,
		tableSearchData,
		rs,
		cw,
		isRowMode,
		rowMove,
		handlers,
		containerRef,
		tableStyle,
		isViewSettingsOpen,
		searchRequest,
	]);

	return (
		<DataTableContext.Provider value={contextValue}>
			<DataTableLayout />
		</DataTableContext.Provider>
	);
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
			<TableContainer />
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

function useDataTableContext(): DataTableContextValue {
	const context = React.useContext(DataTableContext);
	if (!context) {
		throw new Error('DataTable context is not available');
	}
	return context;
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

function buildInitialSearchRequest(
	searchData: SearchData,
	initialRequest?: dyn.RestSearchRequest,
): dyn.RestSearchRequest {
	const storedSize = readStoredPageSize();
	const size = storedSize ?? initialRequest?.size ?? searchData.size;
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
		hasFixHeader: props.hasFixHeader ?? false,
		translationNs: props.translationNs ?? 'common',
		translateFieldName: props.translateFieldName ?? (field => field),
	};
}

/** Parses 1-based page shown in the UI; returns 0-based index for the API, or null if invalid. */
function parseUserFacingPageInput(value: string, totalPages: number): number | null {
	if (!/^\d+$/.test(value.trim())) {
		return null;
	}
	const displayPage = Number(value);
	if (!Number.isInteger(displayPage)) {
		return null;
	}
	if (displayPage < 1 || displayPage > totalPages) {
		return null;
	}
	return displayPage - 1;
}

type DataTableControlsProps = {
	selectedCount: number,
	onClearSelection: () => void,
};

function DataTableControls(props: DataTableControlsProps): React.ReactNode {
	const context = useDataTableContext();
	const onApplyOrderBy = React.useCallback((orderBy: dyn.OrderBy) => {
		context.setSearchRequest(prev => ({
			...prev,
			page: 0,
			graph: updateSearchGraphOrder(prev.graph, orderBy),
		}));
	}, [context]);
	const activeOrderBy = React.useMemo(() => {
		const orderFromRequest = getGraphOrder(context.searchRequest.graph);
		if (orderFromRequest.length > 0) {
			return orderFromRequest;
		}
		return context.settings.orderBy ?? [];
	}, [context.searchRequest.graph, context.settings.orderBy]);
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
				<SearchBox
					fields={context.tableSearchData.desired_fields}
					sortableFields={context.settings.sortableFields ?? context.tableSearchData.desired_fields}
					orderBy={activeOrderBy}
					onApplyOrderBy={onApplyOrderBy}
				/>
			) : null}
			<Pagination />
		</Group>
	);
}

function TableContainer(): React.ReactNode {
	const context = useDataTableContext();
	return (
		<div
			ref={context.containerRef}
			tabIndex={0}
			onKeyDown={context.handlers.onKeyDown}
			className='outline-none overflow-auto min-w-0 w-full max-w-full'
		>
			<Table
				withTableBorder
				withColumnBorders
				striped='even'
				highlightOnHover
				style={context.tableStyle}
				className={clsx({ 'select-none': context.settings.allowRowMovement })}
			>
				<DataTableHead />
				<DataTableBody />
			</Table>
		</div>
	);
}

type ToolbarProps = {
	tableName: string,
	total: number,
	actions: DataTableAction[],
	selectedCount: number,
	onClearSelection: () => void,
	renderTableName?: RenderTableNameFn,
};

function Toolbar(props: ToolbarProps): React.ReactNode {
	const { tableName, total, actions, selectedCount, onClearSelection, renderTableName } = props;
	const context = useDataTableContext();
	const isRowMode = selectedCount > 0;
	const selectedItems = React.useMemo(
		() => context.rs.indexes.map(index => context.tableSearchData.items[index]).filter(Boolean),
		[context.rs.indexes, context.tableSearchData.items],
	);
	const visibleSelectionActions = getVisibleRowSelectionActions(actions, selectedCount);
	const visibleDefaultActions = getVisibleDefaultActions(actions);
	const buttons = visibleDefaultActions.slice(0, 2).filter(a => !a.isSeparator);
	const menuItems = normalizeMenuItems(visibleDefaultActions.slice(2));
	const titleNode = renderTableName
		? renderTableName({ name: tableName, total: total ?? 0 })
		: <Title order={3} className='capitalize'>{tableName} ({total ?? 0})</Title>;
	return (
		<Group gap='xs' className='flex-grow-0'>
			{titleNode}
			{isRowMode ? (
				<Button variant='light' onClick={onClearSelection} rightSection={<IconX size={14} />}>
					{selectedCount} selected
				</Button>
			) : null}
			{isRowMode ? (
				visibleSelectionActions.length > 0
					? <ActionMenu items={visibleSelectionActions} selectedItems={selectedItems} />
					: null
			) : (
				<>
					{buttons.map((action, i) => <ActionButton key={i} action={action} selectedItems={selectedItems} />)}
					{menuItems.length > 0 ? <ActionMenu items={menuItems} selectedItems={selectedItems} /> : null}
				</>
			)}
		</Group>
	);
}

function Pagination(): React.ReactNode {
	const context = useDataTableContext();
	const searchData = context.tableSearchData;
	const totalPages = Math.max(1, Math.ceil(searchData.total / searchData.size));
	const paginationState = usePaginationState(context, totalPages);

	return (
		<Group gap='xs' justify='flex-end' className='flex-grow-0'>
			<span>Page</span>
			<Input
				value={paginationState.pageInput}
				onChange={event => paginationState.setPageInput(event.currentTarget.value)}
				onBlur={paginationState.commitPageChange}
				onKeyDown={(event) => {
					if (event.key === 'Enter') {
						event.preventDefault();
						paginationState.commitPageChange();
					}
				}}
				size='sm' w={50} classNames={{ input: 'text-center' }}
				type='number'
			/>
			<span>of {totalPages}</span>
			<ButtonGroup>
				<Button
					variant='outline'
					size='compact-md'
					onClick={paginationState.onGoPrev}
					disabled={searchData.page <= 0}
					aria-label='Go to previous page'
				>
					<IconChevronLeft />
				</Button>
				<Button
					variant='outline'
					size='compact-md'
					onClick={paginationState.onGoNext}
					disabled={searchData.page >= totalPages - 1}
					aria-label='Go to next page'
				>
					<IconChevronRight />
				</Button>
			</ButtonGroup>
			<Button variant='outline' size='compact-md' onClick={context.onOpenViewSettings}>
				<IconSettings />
			</Button>
		</Group>
	);
}

function usePaginationState(context: DataTableContextValue, totalPages: number) {
	const searchData = context.tableSearchData;
	const [pageInput, setPageInput] = React.useState(String(searchData.page + 1));

	React.useEffect(() => {
		setPageInput(String(searchData.page + 1));
	}, [searchData.page]);

	const updateSearchPage = React.useCallback((nextPage: number) => {
		if (nextPage === searchData.page) {
			return;
		}
		setPageInput(String(nextPage + 1));
		context.setSearchRequest(prev => ({
			...prev,
			page: nextPage,
			size: searchData.size,
		}));
	}, [context, searchData.page, searchData.size]);

	const commitPageChange = React.useCallback(() => {
		const nextPage = parseUserFacingPageInput(pageInput, totalPages);
		if (nextPage === null) {
			setPageInput(String(searchData.page + 1));
			return;
		}
		updateSearchPage(nextPage);
	}, [pageInput, searchData.page, totalPages, updateSearchPage]);

	const onGoPrev = React.useCallback(() => {
		updateSearchPage(Math.max(0, searchData.page - 1));
	}, [searchData.page, updateSearchPage]);

	const onGoNext = React.useCallback(() => {
		updateSearchPage(Math.min(totalPages - 1, searchData.page + 1));
	}, [searchData.page, totalPages, updateSearchPage]);

	return { pageInput, setPageInput, commitPageChange, onGoPrev, onGoNext };
}

function getColWidthStorageKey(): string {
	return typeof window === 'undefined' ? '' : `${storagePrerix}:colwidths:${window.location.pathname}`;
}

function getPageSizeStorageKey(): string {
	return typeof window === 'undefined' ? '' : `${storagePrerix}:pagesize`;
}

function createDefaultWidths(fields: string[]): ColumnWidths {
	return Object.fromEntries(fields.map(field => [field, defaultColumnWidth]));
}

function readStoredWidths(fields: string[]): ColumnWidths {
	const fallback = createDefaultWidths(fields);
	if (typeof window === 'undefined') {
		return fallback;
	}
	const raw = window.localStorage.getItem(getColWidthStorageKey());
	if (!raw) {
		return fallback;
	}
	try {
		const parsed = JSON.parse(raw) as Record<string, number>;
		return Object.fromEntries(fields.map(field => [
			field,
			typeof parsed[field] === 'number' ? parsed[field] : defaultColumnWidth,
		]));
	}
	catch {
		return fallback;
	}
}

function writeStoredWidths(widths: ColumnWidths): void {
	if (typeof window !== 'undefined') {
		window.localStorage.setItem(getColWidthStorageKey(), JSON.stringify(widths));
	}
}

function getCellText(item: SearchItem, field: string, maskedFields: string[]): string {
	if (maskedFields.includes(field)) {
		return '********';
	}
	return String(item[field] ?? '');
}

function getRowNumber(page: number, size: number, rowIndex: number): number {
	return (page * size) + rowIndex + 1;
}

function getColumnWidth(field: string, widths: ColumnWidths): number {
	return widths[field] ?? defaultColumnWidth;
}

function getColumnStyle(width: number): React.CSSProperties {
	// return { width, minWidth: width, maxWidth: width };
	return { width, minWidth: 0, maxWidth: 'none' };
}

function shouldShowSelectionAction(action: DataTableAction, selectedCount: number): boolean {
	if (action.isSeparator) return true;
	if (!action.requireSelection || selectedCount === 0) {
		return false;
	}
	if (!action.supportMultiple) {
		return selectedCount === 1;
	}
	return true;
}

function getVisibleRowSelectionActions(actions: DataTableAction[], selectedCount: number): DataTableAction[] {
	return normalizeMenuItems(actions.filter(action => shouldShowSelectionAction(action, selectedCount)));
}

function getVisibleDefaultActions(actions: DataTableAction[]): DataTableAction[] {
	return normalizeMenuItems(actions.filter(action => !action.requireSelection));
}

function normalizeMenuItems(items: DataTableAction[]): DataTableAction[] {
	const normalized: DataTableAction[] = [];
	for (const item of items) {
		if (item.isSeparator) {
			if (normalized.length === 0 || normalized[normalized.length - 1].isSeparator) {
				continue;
			}
			normalized.push(item);
			continue;
		}
		normalized.push(item);
	}
	if (normalized.length > 0 && normalized[normalized.length - 1].isSeparator) {
		normalized.pop();
	}
	return normalized;
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

function shouldUseSingleLineEllipsis(value: string): boolean {
	const normalized = value.trim();
	return normalized.length > 0 && !/\s/.test(normalized);
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

function getAutoColumnWidth(field: string, searchData: SearchData): number {
	const longest = searchData.items.reduce((max, item) => {
		const value = getCellText(item, field, searchData.masked_fields);
		return Math.max(max, value.length);
	}, field.length);
	const estimated = (longest * characterPixelWidth) + cellHorizontalPadding;
	return Math.min(maximumAutoColumnWidth, Math.max(minimumColumnWidth, estimated));
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


function useColumnWidthsState(fields: string[]) {
	const [widths, setWidths] = React.useState<ColumnWidths>({});
	const [resizing, setResizing] = React.useState<ResizeState | null>(null);

	React.useEffect(() => {
		setWidths(readStoredWidths(fields));
	}, [fields]);

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

	React.useEffect(() => {
		if (!resizing && Object.keys(widths).length > 0) {
			writeStoredWidths(widths);
		}
	}, [resizing, widths]);

	return { widths, setWidths, resizing, setResizing };
}

function useRowSelectionState(rowCount: number) {
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

function useRowMoveState(
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

type RowNumberOverlayButtonProps = {
	children: React.ReactNode,
	onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => void,
	'aria-label'?: string,
};

function RowNumberOverlayButton(props: RowNumberOverlayButtonProps): React.ReactNode {
	function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>): void {
		if (event.key !== ' ') {
			return;
		}
		event.preventDefault();
		props.onMouseDown(event as unknown as React.MouseEvent<HTMLButtonElement>);
	}
	return (
		<button
			type='button'
			className={clsx(
				'absolute top-0 left-0 w-full h-full bg-transparent border-none cursor-pointer',
				'flex items-center justify-center',
			)}
			onMouseDown={props.onMouseDown}
			onKeyDown={handleKeyDown}
			aria-label={props['aria-label']}
		>
			{props.children}
		</button>
	);
}

type RowNumberHeaderProps = {
	isRowMode: boolean,
	onToggle: () => void,
};

function RowNumberHeader(props: RowNumberHeaderProps): React.ReactNode {
	const columnWidth = rowNumberColumnWidth;
	return (
		<Table.Th
			className='p-0 text-center align-middle relative'
			style={getColumnStyle(columnWidth)}
		>
			<RowNumberOverlayButton
				onMouseDown={() => props.onToggle()}
				aria-label={props.isRowMode ? 'Deselect all rows' : 'Select all rows'}
			>
				{props.isRowMode ? <IconX size={14} /> : <IconHash size={14} />}
			</RowNumberOverlayButton>
		</Table.Th>
	);
}

type ResizeHandleProps = {
	field: string,
	onStartResize: (field: string, e: React.MouseEvent<HTMLDivElement>) => void,
	onAutoResize: (field: string) => void,
};

function ResizeHandle(props: ResizeHandleProps): React.ReactNode {
	return (
		<div
			role='separator'
			aria-label={`Resize ${props.field}`}
			onMouseDown={e => props.onStartResize(props.field, e)}
			onDoubleClick={() => props.onAutoResize(props.field)}
			className={classes.resizeHandle}
		/>
	);
}

type ColumnHeaderProps = {
	field: string,
	width: number,
	sortDirection?: dyn.SearchOrder,
	allowColumnResizing: boolean,
	translateFieldName: (field: string) => string,
	onStartResize: ResizeHandleProps['onStartResize'],
	onAutoResize: ResizeHandleProps['onAutoResize'],
};

function ColumnHeader(props: ColumnHeaderProps): React.ReactNode {
	return (
		<Table.Th style={getColumnStyle(props.width)} className={classes.resizeableHeader}>
			<Group justify='space-between' gap={1} className='overflow-hidden text-ellipsis whitespace-nowrap'>
				{/* <div className='overflow-hidden text-ellipsis whitespace-nowrap flex items-center gap-1' title={props.field}> */}
				<span className='overflow-hidden text-ellipsis whitespace-nowrap'>{props.translateFieldName(props.field)}</span>
				{props.sortDirection === 'asc' ? <IconSortAscending size={16} /> : null}
				{props.sortDirection === 'desc' ? <IconSortDescending size={16} /> : null}
				{/* </div> */}
			</Group>
			{props.allowColumnResizing ? (
				<ResizeHandle
					field={props.field}
					onStartResize={props.onStartResize}
					onAutoResize={props.onAutoResize}
				/>
			) : null}
		</Table.Th>
	);
}

function DataTableHead(): React.ReactNode {
	const context = useDataTableContext();
	const fields = context.tableSearchData.desired_fields;
	const widths = context.cw.widths;
	const orderBy = getGraphOrder(context.searchRequest.graph).length > 0
		? getGraphOrder(context.searchRequest.graph)
		: (context.settings.orderBy ?? []);
	const sortOrderMap = React.useMemo(
		() => new Map(orderBy.map(([field, direction]) => [field, direction])),
		[orderBy],
	);
	return (
		<Table.Thead className={clsx({
			[classes.stickyHeader]: context.settings.hasFixHeader,
		})}>
			<Table.Tr>
				<RowNumberHeader
					isRowMode={context.isRowMode}
					onToggle={context.handlers.onToggleAll}
				/>
				{fields.map(field => (
					<ColumnHeader
						key={field}
						field={field}
						width={getColumnWidth(field, widths)}
						sortDirection={sortOrderMap.get(field)}
						allowColumnResizing={context.settings.allowColumnResizing}
						translateFieldName={context.settings.translateFieldName}
						onStartResize={context.handlers.onStartResize}
						onAutoResize={context.handlers.onAutoResize}
					/>
				))}
				{context.settings.allowColumnResizing ? (
					<Table.Th className={classes.fillerColumn} aria-hidden />
				) : null}
			</Table.Tr>
		</Table.Thead>
	);
}

type RowNumberCellProps = {
	rowIndex: number,
	rowNumber: number,
	isSelected: boolean,
	onMouseDown: (
		e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>,
		idx: number,
	) => void,
	onMouseEnter: (idx: number) => void,
};

function RowNumberCell(props: RowNumberCellProps): React.ReactNode {
	const columnWidth = rowNumberColumnWidth;
	return (
		<Table.Td
			p={0}
			onMouseEnter={() => props.onMouseEnter(props.rowIndex)}
			className={clsx(
				'text-center align-middle relative',
				classes.rowNumberCell, {
					[classes.selectedCell]: props.isSelected,
					'cursor-pointer': true,
				},
			)}
			style={getColumnStyle(columnWidth)}
		>
			<RowNumberOverlayButton onMouseDown={(e) => props.onMouseDown(e, props.rowIndex)}>
				{props.rowNumber}
			</RowNumberOverlayButton>
		</Table.Td>
	);
}

type DataCellProps = {
	width: number,
	value: string,
	rawValue: unknown,
	fieldSchema?: dyn.ModelSchemaField,
	linkHref?: string,
	fieldRenderer?: IFieldRenderer,
	isSelected: boolean,
	onMouseDown: (e: React.MouseEvent<HTMLTableCellElement>, rowIndex: number) => void,
	rowIndex: number,
};

function DataCell(props: DataCellProps): React.ReactNode {
	const context = useDataTableContext();
	const t = useTranslate(context.settings.translationNs);
	const resolved = useResolvedPath(props.linkHref ?? '.');
	const content = React.useMemo(
		() => renderDataCellContent(props.rawValue, props.value, props.fieldSchema, props.fieldRenderer, t),
		[props.fieldSchema, props.fieldRenderer, props.rawValue, t, props.value],
	);
	const useEllipsis = shouldUseSingleLineEllipsis(props.value) && !isArrayField(props.fieldSchema);
	const contentClassName = clsx('block', {
		'overflow-hidden text-ellipsis whitespace-nowrap': useEllipsis,
		'whitespace-normal break-words': !useEllipsis,
	});
	const linkClassName = clsx(contentClassName, classes.cellRowLink);

	return (
		<Table.Td
			style={getColumnStyle(props.width)}
			onMouseDown={e => props.onMouseDown(e, props.rowIndex)}
			className={clsx({
				[classes.selectedCell]: props.isSelected,
				'cursor-move': context.settings.allowRowMovement,
			})}
		>
			{props.linkHref ? (
				<Anchor
					component={Link}
					to={resolved.pathname}
					className={linkClassName}
					title={useEllipsis ? props.value : undefined}
					tabIndex={-1}
				>
					{content}
				</Anchor>
			) : <div className={contentClassName} title={useEllipsis ? props.value : undefined}>{content}</div>}
		</Table.Td>
	);
}

type BodyRowProps = {
	item: SearchItem,
	rowIndex: number,
	isRowSelected: boolean,
};

function BodyRow(props: BodyRowProps): React.ReactNode {
	const context = useDataTableContext();
	const { item, rowIndex, isRowSelected } = props;
	const searchData = context.tableSearchData;
	const widths = context.cw.widths;
	const rowMove = context.rowMove;
	const rowLink = context.settings.buildLinkHref?.(item);
	const rowNumber = getRowNumber(searchData.page, searchData.size, props.rowIndex);
	const showDropIndicator = rowMove.state.draggingIndex !== null && rowMove.state.dropIndex === rowIndex;
	const onDragOver = (event: React.DragEvent<HTMLTableRowElement>) => {
		if (!context.settings.allowRowMovement) {
			return;
		}
		event.preventDefault();
		rowMove.dragOver(rowIndex);
	};
	return (
		<Table.Tr
			draggable={context.settings.allowRowMovement}
			onDragStart={() => rowMove.startDragging(rowIndex)}
			onDragOver={onDragOver}
			onDrop={() => rowMove.drop(rowIndex)}
			onDragEnd={rowMove.cancel}
			className={clsx({ [classes.rowDropIndicator]: showDropIndicator })}
		>
			<RowNumberCell
				rowIndex={rowIndex} rowNumber={rowNumber} isSelected={isRowSelected}
				onMouseDown={context.handlers.onRowMouseDown}
				onMouseEnter={context.handlers.onRowMouseEnter}
			/>
			{searchData.desired_fields.map(field => (
				<DataCell
					key={field}
					rowIndex={rowIndex}
					width={getColumnWidth(field, widths)}
					value={getCellText(item, field, searchData.masked_fields)}
					rawValue={item[field]}
					fieldSchema={context.settings.modelSchema?.fields[field]}
					linkHref={rowLink}
					fieldRenderer={context.settings.fieldRenderer?.[field]}
					isSelected={isRowSelected}
					onMouseDown={context.handlers.onDataCellMouseDown}
				/>
			))}
			{context.settings.allowColumnResizing ? (
				<Table.Td
					className={clsx(classes.fillerColumn, {
						[classes.selectedCell]: isRowSelected,
					})}
					onMouseDown={e => context.handlers.onDataCellMouseDown(e, rowIndex)}
					aria-hidden
				/>
			) : null}
		</Table.Tr>
	);
}

function DataTableBody(): React.ReactNode {
	const context = useDataTableContext();
	const searchData = context.tableSearchData;
	const selectedRows = context.rs.rows;
	return (
		<Table.Tbody>
			{searchData.items.map((item, rowIndex) => (
				<BodyRow
					key={item.id ?? rowIndex}
					item={item}
					rowIndex={rowIndex}
					isRowSelected={Boolean(selectedRows[rowIndex])}
				/>
			))}
		</Table.Tbody>
	);
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
	gridMode: string,
	onGridModeChange: (value: string) => void,
}): React.ReactNode {
	const t = useTranslate('common');
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
				/>
			</Stack>
			<Stack gap='xs'>
				<Text size='sm' fw={500}>{t('datatable.viewMode')}</Text>
				<Radio.Group onChange={props.onGridModeChange} value={props.gridMode}>
					<Stack gap='xs'>
						<Radio value='list' label={t('datatable.list')} />
						<Radio value='grid' label={t('datatable.grid')} />
					</Stack>
				</Radio.Group>
			</Stack>
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
	filteredFields: string[],
	fieldsPanelNonce: number,
	fieldsSelectionGetterRef: React.RefObject<(() => string[]) | null>,
	initialSelectedFieldNames: string[],
	translationNs: string,
	draftPageSize: string,
	onDraftPageSizeChange: (value: string) => void,
	gridMode: string,
	onGridModeChange: (value: string) => void,
	onApply: () => void,
};

function ViewSettingsModalView(props: ViewSettingsModalViewProps): React.ReactNode {
	const t = useTranslate('common');

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
						<Tabs.Tab value='fields-settings' className='capitalize'>{t('datatable.fields')}</Tabs.Tab>
						<Tabs.Tab value='table-settings' className='capitalize'>{t('datatable.view')}</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel pt='sm' value='fields-settings'>
						<TextInput
							onChange={event => props.onFieldSearchChange(event.currentTarget.value)}
							placeholder={t('datatable.fieldFilterPlaceholder')}
							value={props.fieldSearch}
						/>
						<FieldsSettingsTable
							fields={props.filteredFields}
							fieldsPanelNonce={props.fieldsPanelNonce}
							initialSelectedFieldNames={props.initialSelectedFieldNames}
							selectionGetterRef={props.fieldsSelectionGetterRef}
							translationNs={props.translationNs}
						/>
					</Tabs.Panel>
					<Tabs.Panel pt='sm' value='table-settings'>
						<TableSettingsPanel
							draftPageSize={props.draftPageSize}
							gridMode={props.gridMode}
							onDraftPageSizeChange={props.onDraftPageSizeChange}
							onGridModeChange={props.onGridModeChange}
						/>
					</Tabs.Panel>
				</Tabs>
				<Box className='border-t border-gray-300 mt-auto pt-3'>
					<Group justify='flex-end'>
						<Button onClick={props.onClose} variant='default'>{t('action.cancel')}</Button>
						<Button onClick={props.onApply}>{t('action.apply')}</Button>
					</Group>
				</Box>
			</Stack>
		</Modal>
	);
}

function ViewSettingsModal(props: ViewSettingsModalProps): React.ReactNode {
	const { opened, onClose, modelSchema, desiredFields } = props;
	const context = useDataTableContext();
	const { searchRequest, setSearchRequest } = context;
	const [activeTab, setActiveTab] = React.useState<string | null>('fields-settings');
	const [fieldSearch, setFieldSearch] = React.useState('');
	const [draftPageSize, setDraftPageSize] = React.useState(String(allowedPageSizes[0]));
	const [gridMode, setGridMode] = React.useState('list');
	const fieldsSelectionGetterRef = React.useRef<(() => string[]) | null>(null);
	const [fieldsPanelNonce, setFieldsPanelNonce] = React.useState(0);
	const allSelectableFields = React.useMemo(
		() => (modelSchema ? getSelectableSchemaFieldNames(modelSchema) : [...desiredFields]),
		[desiredFields, modelSchema],
	);
	const filteredFields = React.useMemo(
		() => filterFields(allSelectableFields, fieldSearch),
		[allSelectableFields, fieldSearch],
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
		const fieldOrder = fieldsSelectionGetterRef.current?.() ?? [];
		setSearchRequest(prev => ({
			...prev,
			fields: fieldOrder.length > 0 ? fieldOrder : undefined,
			page: 0,
			size,
		}));
		onClose();
	}, [draftPageSize, onClose, setSearchRequest]);

	return (
		<ViewSettingsModalView
			activeTab={activeTab}
			draftPageSize={draftPageSize}
			fieldSearch={fieldSearch}
			fieldsPanelNonce={fieldsPanelNonce}
			fieldsSelectionGetterRef={fieldsSelectionGetterRef}
			filteredFields={filteredFields}
			gridMode={gridMode}
			initialSelectedFieldNames={desiredFields}
			opened={opened}
			translationNs={context.settings.translationNs}
			onActiveTabChange={setActiveTab}
			onApply={applyViewSettings}
			onClose={onClose}
			onDraftPageSizeChange={setDraftPageSize}
			onFieldSearchChange={setFieldSearch}
			onGridModeChange={setGridMode}
		/>
	);
}

const fieldsSettingsTableColumn = 'datatable.fields';

function FieldsSettingsTable(props: {
	fields: string[],
	fieldsPanelNonce: number,
	initialSelectedFieldNames: string[],
	selectionGetterRef: React.RefObject<(() => string[]) | null>,
	translationNs: string,
}): React.ReactNode {
	const t = useTranslate(props.translationNs);
	return (
		<div className='mt-2' key={props.fieldsPanelNonce}>
			<SettingsTable
				allowRowMovement
				data={createFieldsSearchData(props.fields)}
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
		// [colLabel]: translateFieldName(field),
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

function isArrayField(fieldSchema?: dyn.ModelSchemaField): boolean {
	if (!fieldSchema || typeof fieldSchema.data_type === 'string') {
		return false;
	}
	return fieldSchema.data_type.is_array === true;
}

function getFieldDataTypeName(fieldSchema?: dyn.ModelSchemaField): dyn.ModelSchemaFieldDataTypeName | null {
	if (!fieldSchema) {
		return null;
	}
	if (typeof fieldSchema.data_type === 'string') {
		return fieldSchema.data_type;
	}
	return fieldSchema.data_type.name;
}

function renderDataCellContent(
	rawValue: unknown,
	textValue: string,
	fieldSchema: dyn.ModelSchemaField | undefined,
	fieldRenderer: IFieldRenderer | undefined,
	t: TranslateFn,
): React.ReactNode {
	if (fieldRenderer) {
		return applyCustomRenderer(fieldRenderer, textValue, t);
	}
	const dataTypeName = getFieldDataTypeName(fieldSchema);
	if (!isArrayField(fieldSchema)) {
		return renderDefaultByDataType(rawValue, textValue, dataTypeName);
	}
	const values = Array.isArray(rawValue) ? rawValue : (rawValue == null || rawValue === '' ? [] : [rawValue]);
	if (values.length === 0) {
		return '';
	}
	return values.map((value, index) => (
		<React.Fragment key={`${String(value)}-${index}`}>
			{renderDefaultByDataType(value, String(value ?? ''), dataTypeName)}
			{index < values.length - 1 ? <br /> : null}
		</React.Fragment>
	));
}

function getGraphOrder(graph?: dyn.SearchGraph): dyn.OrderBy {
	const rawOrder = (graph as Partial<dyn.SearchGraph> | undefined)?.order;
	if (!Array.isArray(rawOrder)) {
		return [];
	}
	return rawOrder.filter(
		(item): item is [string, dyn.SearchOrder] =>
			Array.isArray(item)
			&& item.length === 2
			&& typeof item[0] === 'string'
			&& (item[1] === 'asc' || item[1] === 'desc'),
	);
}

function updateSearchGraphOrder(graph: dyn.SearchGraph | undefined, orderBy: dyn.OrderBy): dyn.SearchGraph | undefined {
	const graphData = { ...(graph as Partial<dyn.SearchGraph> | undefined) };
	if (orderBy.length === 0) {
		delete graphData.order;
		if (!graphData.condition && !graphData.and && !graphData.or) {
			return undefined;
		}
		return graphData as dyn.SearchGraph;
	}
	return { ...graphData, order: orderBy } as dyn.SearchGraph;
}

function filterFields(fields: string[], query: string): string[] {
	const trimmed = query.trim().toLowerCase();
	if (!trimmed) {
		return fields;
	}
	return fields.filter(field => field.toLowerCase().includes(trimmed));
}

function getSelectableSchemaFieldNames(schema: dyn.ModelSchema): string[] {
	return Object.values(schema.fields)
		.filter(field => !field.is_system_field)
		.map(field => field.name);
}


type ActionTriggerProps = {
	action: DataTableAction,
	selectedItems: Record<string, unknown>[],
};

function ActionButton({ action, selectedItems }: ActionTriggerProps): React.ReactNode {
	if (action.href) {
		return (
			<Button
				component={Link}
				to={action.href}
				relative='path'
				variant='outline'
				size='compact-md'
				leftSection={action.icon}
			>
				{action.label}
			</Button>
		);
	}
	return (
		<Button
			variant='outline'
			size='compact-md'
			leftSection={action.icon}
			onClick={() => action.onTrigger?.(selectedItems)}
		>
			{action.label}
		</Button>
	);
}

function ActionMenu(
	{ items, selectedItems }: { items: DataTableAction[], selectedItems: Record<string, unknown>[] },
): React.ReactNode {
	return (
		<Menu shadow='md' position='bottom-end'>
			<Menu.Target>
				<Button variant='outline' size='compact-md' aria-label='More actions'>
					<IconDots size={16} />
				</Button>
			</Menu.Target>
			<Menu.Dropdown>
				{items.map((item, i) => (item.isSeparator
					? <Menu.Divider key={i} />
					: (
						<Menu.Item
							key={i}
							leftSection={item.icon}
							onClick={() => item.onTrigger?.(selectedItems)}
						>
							{item.label}
						</Menu.Item>
					)
				))}
			</Menu.Dropdown>
		</Menu>
	);
}

type TableHandlersArgs = {
	searchData: SearchData,
	cw: ReturnType<typeof useColumnWidthsState>,
	rs: ReturnType<typeof useRowSelectionState>,
	containerRef: React.RefObject<HTMLDivElement | null>,
};

function useTableHandlers(args: TableHandlersArgs) {
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
		// event.preventDefault();
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
