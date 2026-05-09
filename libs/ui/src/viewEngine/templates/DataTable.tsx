import {
	Anchor, Box, Button, ButtonGroup, Checkbox, Group, Input, Menu, Modal, Radio, Select,
	Stack, Table, Tabs, Text, TextInput, Title,
} from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamic_model';
import {
	IconChevronLeft, IconChevronRight, IconDots, IconHash, IconSettings, IconX,
} from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';

import classes from './DataTable.module.css';
import { SearchBox } from './SearchBox';
import { ThunkPackHookReturn } from '../../appState';


export type DataTableActionHook = {
	label?: string,
	icon?: React.ReactNode,
	isSeparator?: boolean,
	supportMultiple?: boolean,
	requireSelection?: boolean,
	actionHook?: () => ThunkPackHookReturn<any, any>,
};

export interface IFieldRenderHint {
	readonly type: string;
	render(value: string): React.ReactNode;
}

export type FieldRenderHintMap = Record<string, IFieldRenderHint>;

type SearchItem = Record<string, any>;
export type SearchData = dyn.RestSearchResponse<SearchItem>;

type RowSelection = Record<number, boolean>;
type RowDragState = { isActive: boolean, targetSelected: boolean };
type RowMoveState = { draggingIndex: number | null, dropIndex: number | null };
type ColumnWidths = Record<string, number>;
type ResizeState = { field: string, startX: number, startWidth: number };
type SelectionColumn = 'checkbox' | 'number';
type RowMovePayload = {
	fromIndex: number,
	toIndex: number,
	items: SearchItem[],
};

const rowNumberColumnWidth = 64;
const checkboxColumnWidth = 40;
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
	fieldRenderHint?: FieldRenderHintMap,
	linkField?: string,
	linkRoutePath?: string,
	actions?: DataTableActionHook[],
	allowColumnResizing?: boolean,
	isFullWidthTable?: boolean,
	selectionColumn?: SelectionColumn,
	allowRowMovement?: boolean,
	onRowMoved?: (payload: RowMovePayload) => void,
	showControls?: boolean,
	hasFixHeader?: boolean,
	renderTableName?: RenderTableNameFn,
	modelSchema?: dyn.ModelSchema,
	/** Row keys to select on mount (fields-settings nested table). */
	initialSelectedFieldNames?: string[],
	fieldsSettingsValueKey?: string,
	fieldsSettingsSelectionGetterRef?: React.MutableRefObject<(() => string[]) | null>,
};

type RequiredDataTableProps = Omit<
	DataTableProps,
	'actions' | 'allowColumnResizing' | 'isFullWidthTable' | 'selectionColumn'
	| 'allowRowMovement' | 'showControls' | 'hasFixHeader'
> & {
	actions: DataTableActionHook[],
	allowColumnResizing: boolean,
	isFullWidthTable: boolean,
	selectionColumn: SelectionColumn,
	allowRowMovement: boolean,
	showControls: boolean,
	hasFixHeader: boolean,
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

function useFieldsSettingsBindings(
	settings: RequiredDataTableProps,
	tableSearchData: SearchData,
	rowMove: ReturnType<typeof useRowMoveState>,
	rs: ReturnType<typeof useRowSelectionState>,
): void {
	const fieldsSettingsValueKey = settings.fieldsSettingsValueKey ?? 'field';
	const fieldsSettingsItemSig = settings.initialSelectedFieldNames === undefined
		? ''
		: tableSearchData.items.map(item => String(item[fieldsSettingsValueKey])).sort().join('\0');
	const initialSelectedFieldNamesKey = settings.initialSelectedFieldNames?.join('\0');
	React.useEffect(() => {
		if (settings.initialSelectedFieldNames === undefined || initialSelectedFieldNamesKey === undefined) {
			return;
		}
		const selected = new Set(settings.initialSelectedFieldNames);
		const next: RowSelection = {};
		tableSearchData.items.forEach((item, idx) => {
			if (selected.has(String(item[fieldsSettingsValueKey]))) {
				next[idx] = true;
			}
		});
		rs.setRows(next);
	}, [fieldsSettingsItemSig, fieldsSettingsValueKey, initialSelectedFieldNamesKey, rs.setRows]);
	React.useLayoutEffect(() => {
		const ref = settings.fieldsSettingsSelectionGetterRef;
		if (!ref) {
			return undefined;
		}
		ref.current = () => rowMove.items
			.map((item, idx) => ({ name: String(item[fieldsSettingsValueKey]), idx }))
			.filter(x => rs.rows[x.idx])
			.map(x => x.name);
		return () => {
			ref.current = null;
		};
	}, [fieldsSettingsValueKey, rowMove.items, rs.rows, settings.fieldsSettingsSelectionGetterRef]);
}

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
	useFieldsSettingsBindings(settings, tableSearchData, rowMove, rs);
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
		selectionColumn: props.selectionColumn ?? 'number',
		allowRowMovement: props.allowRowMovement ?? false,
		showControls: props.showControls ?? true,
		hasFixHeader: props.hasFixHeader ?? false,
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
			<SearchBox fields={context.tableSearchData.desired_fields} />
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
	actions: DataTableActionHook[],
	selectedCount: number,
	onClearSelection: () => void,
	renderTableName?: RenderTableNameFn,
};

function Toolbar(props: ToolbarProps): React.ReactNode {
	const { tableName, total, actions, selectedCount, onClearSelection, renderTableName } = props;
	const isRowMode = selectedCount > 0;
	const visibleSelectionActions = getVisibleRowSelectionActions(actions, selectedCount);
	const visibleDefaultActions = getVisibleDefaultActions(actions);
	const buttons = visibleDefaultActions.slice(0, 2).filter(a => !a.isSeparator);
	const menuItems = normalizeMenuItems(visibleDefaultActions.slice(2));
	const titleNode = renderTableName
		? renderTableName({ name: tableName, total: total ?? 0 })
		: <Title order={3}>{tableName} ({total ?? 0})</Title>;
	return (
		<Group gap='xs' className='flex-grow-0'>
			{titleNode}
			{isRowMode ? (
				<Button variant='light' onClick={onClearSelection} rightSection={<IconX size={14} />}>
					{selectedCount} selected
				</Button>
			) : null}
			{isRowMode ? (
				visibleSelectionActions.length > 0 ? <ActionMenu items={visibleSelectionActions} /> : null
			) : (
				<>
					{buttons.map((action, i) => <ActionButton key={i} action={action} />)}
					{menuItems.length > 0 ? <ActionMenu items={menuItems} /> : null}
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

function getSelectionColumnWidth(selectionColumn: SelectionColumn): number {
	return selectionColumn === 'checkbox' ? checkboxColumnWidth : rowNumberColumnWidth;
}

function getColumnStyle(width: number): React.CSSProperties {
	// return { width, minWidth: width, maxWidth: width };
	return { width, minWidth: 0, maxWidth: 'none' };
}

function shouldShowSelectionAction(action: DataTableActionHook, selectedCount: number): boolean {
	if (action.isSeparator) return true;
	if (!action.requireSelection || selectedCount === 0) {
		return false;
	}
	if (!action.supportMultiple) {
		return selectedCount === 1;
	}
	return true;
}

function getVisibleRowSelectionActions(actions: DataTableActionHook[], selectedCount: number): DataTableActionHook[] {
	return normalizeMenuItems(actions.filter(action => shouldShowSelectionAction(action, selectedCount)));
}

function getVisibleDefaultActions(actions: DataTableActionHook[]): DataTableActionHook[] {
	return normalizeMenuItems(actions.filter(action => !action.requireSelection));
}

function normalizeMenuItems(items: DataTableActionHook[]): DataTableActionHook[] {
	const normalized: DataTableActionHook[] = [];
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

function toggleRowSelection(
	rs: ReturnType<typeof useRowSelectionState>,
	rowIndex: number,
): void {
	const next = !rs.rows[rowIndex];
	rs.setRows(prev => ({ ...prev, [rowIndex]: next }));
	rs.setAnchor(rowIndex);
}

function clearRows(rs: ReturnType<typeof useRowSelectionState>): void {
	rs.setRows({});
	rs.setAnchor(null);
	rs.setDrag({ isActive: false, targetSelected: false });
}

function buildRowLink(linkRoutePath: string, row: SearchItem): string {
	return linkRoutePath.replace(/:([a-zA-Z0-9_]+)/g, (_, fieldName: string) =>
		encodeURIComponent(String(row[fieldName] ?? '')));
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
	return (
		<button
			type='button'
			className={clsx(
				'absolute top-0 left-0 w-full h-full bg-transparent border-none cursor-pointer',
				'flex items-center justify-center',
			)}
			onMouseDown={props.onMouseDown}
			aria-label={props['aria-label']}
		>
			{props.children}
		</button>
	);
}

type RowNumberHeaderProps = {
	isRowMode: boolean,
	selectionColumn: SelectionColumn,
	selectedCount: number,
	rowCount: number,
	onToggle: () => void,
};

function RowNumberHeader(props: RowNumberHeaderProps): React.ReactNode {
	const isCheckbox = props.selectionColumn === 'checkbox';
	const columnWidth = getSelectionColumnWidth(props.selectionColumn);
	const isIndeterminate = props.selectedCount > 0 && props.selectedCount < props.rowCount;
	return (
		<Table.Th
			className='p-0 text-center align-middle relative'
			style={getColumnStyle(columnWidth)}
		>
			{isCheckbox ? (
				<div className='flex items-center justify-center'>
					<Checkbox
						checked={props.isRowMode}
						indeterminate={isIndeterminate}
						onChange={props.onToggle}
						onClick={event => event.stopPropagation()}
						aria-label='Select all rows'
					/>
				</div>
			) : (
				<RowNumberOverlayButton
					onMouseDown={() => props.onToggle()}
					aria-label={props.isRowMode ? 'Deselect all rows' : 'Select all rows'}
				>
					{props.isRowMode ? <IconX size={14} /> : <IconHash size={14} />}
				</RowNumberOverlayButton>
			)}
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
	allowColumnResizing: boolean,
	onStartResize: ResizeHandleProps['onStartResize'],
	onAutoResize: ResizeHandleProps['onAutoResize'],
};

function ColumnHeader(props: ColumnHeaderProps): React.ReactNode {
	return (
		<Table.Th style={getColumnStyle(props.width)} className={classes.resizeableHeader}>
			<div className='overflow-hidden text-ellipsis whitespace-nowrap' title={props.field}>
				{props.field}
			</div>
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
	const selectedCount = context.rs.indexes.length;
	const rowCount = context.tableSearchData.items.length;
	return (
		<Table.Thead className={clsx({
			[classes.stickyHeader]: context.settings.hasFixHeader,
		})}>
			<Table.Tr>
				<RowNumberHeader
					isRowMode={context.isRowMode}
					selectedCount={selectedCount}
					rowCount={rowCount}
					selectionColumn={context.settings.selectionColumn}
					onToggle={context.handlers.onToggleAll}
				/>
				{fields.map(field => (
					<ColumnHeader
						key={field}
						field={field}
						width={getColumnWidth(field, widths)}
						allowColumnResizing={context.settings.allowColumnResizing}
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
	selectionColumn: SelectionColumn,
	onMouseDown: (e: React.MouseEvent<HTMLButtonElement>, idx: number) => void,
	onMouseEnter: (idx: number) => void,
	onToggle: (idx: number) => void,
};

function RowNumberCell(props: RowNumberCellProps): React.ReactNode {
	const isCheckbox = props.selectionColumn === 'checkbox';
	const columnWidth = getSelectionColumnWidth(props.selectionColumn);
	const displayValue = props.selectionColumn === 'checkbox'
		? (
			<div className='flex items-center justify-center'>
				<Checkbox
					checked={props.isSelected}
					onChange={() => props.onToggle(props.rowIndex)}
					onClick={event => event.stopPropagation()}
					aria-label={`Select row ${props.rowNumber}`}
				/>
			</div>
		)
		: (
			<RowNumberOverlayButton onMouseDown={(e) => props.onMouseDown(e, props.rowIndex)}>
				{props.rowNumber}
			</RowNumberOverlayButton>
		);
	return (
		<Table.Td
			p={0}
			onMouseEnter={() => props.onMouseEnter(props.rowIndex)}
			// onMouseDown={isCheckbox ? undefined : (e => props.onMouseDown(e, props.rowIndex))}
			className={clsx(
				'text-center align-middle relative',
				classes.rowNumberCell, {
					[classes.selectedCell]: props.isSelected,
					'cursor-pointer': !isCheckbox,
				},
			)}
			style={getColumnStyle(columnWidth)}
		>
			{displayValue}
		</Table.Td>
	);
}

type DataCellProps = {
	width: number,
	value: string,
	linkHref?: string,
	hint?: IFieldRenderHint,
	isSelected: boolean,
	allowRowMovement?: boolean,
};

function DataCell(props: DataCellProps): React.ReactNode {
	const content = props.hint ? props.hint.render(props.value) : props.value;
	const useEllipsis = shouldUseSingleLineEllipsis(props.value);
	const contentClassName = clsx('block', {
		'overflow-hidden text-ellipsis whitespace-nowrap': useEllipsis,
		'whitespace-normal break-words': !useEllipsis,
	});
	return (
		<Table.Td
			style={getColumnStyle(props.width)}
			className={clsx({
				[classes.selectedCell]: props.isSelected,
				'cursor-move': props.allowRowMovement,
			})}
		>
			{props.linkHref ? (
				<Anchor
					href={props.linkHref}
					onMouseDown={event => event.stopPropagation()}
					className={contentClassName}
					title={useEllipsis ? props.value : undefined}
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
	searchData: SearchData,
	widths: ColumnWidths,
	isRowSelected: boolean,
	hints?: FieldRenderHintMap,
	linkField?: string,
	linkRoutePath?: string,
	selectionColumn: SelectionColumn,
	allowRowMovement: boolean,
	allowColumnResizing: boolean,
	rowMove: ReturnType<typeof useRowMoveState>,
	onRowMouseDown: RowNumberCellProps['onMouseDown'],
	onRowMouseEnter: RowNumberCellProps['onMouseEnter'],
	onToggleRow: RowNumberCellProps['onToggle'],
};

function BodyRow(props: BodyRowProps): React.ReactNode {
	const {
		item,
		rowIndex,
		searchData,
		widths,
		isRowSelected,
		hints,
		linkField,
		linkRoutePath,
		selectionColumn,
		allowRowMovement,
		allowColumnResizing,
		rowMove,
	} = props;
	const rowLink = linkRoutePath ? buildRowLink(linkRoutePath, item) : undefined;
	const rowNumber = getRowNumber(searchData.page, searchData.size, rowIndex);
	const showDropIndicator = rowMove.state.draggingIndex !== null && rowMove.state.dropIndex === rowIndex;
	const onDragOver = (event: React.DragEvent<HTMLTableRowElement>) => {
		if (!allowRowMovement) {
			return;
		}
		event.preventDefault();
		rowMove.dragOver(rowIndex);
	};
	return (
		<Table.Tr
			draggable={allowRowMovement}
			onDragStart={() => rowMove.startDragging(rowIndex)}
			onDragOver={onDragOver}
			onDrop={() => rowMove.drop(rowIndex)}
			onDragEnd={rowMove.cancel}
			className={clsx({ [classes.rowDropIndicator]: showDropIndicator })}
		>
			<RowNumberCell
				rowIndex={rowIndex} rowNumber={rowNumber} isSelected={isRowSelected}
				selectionColumn={selectionColumn}
				onMouseDown={props.onRowMouseDown}
				onMouseEnter={props.onRowMouseEnter}
				onToggle={props.onToggleRow}
			/>
			{searchData.desired_fields.map(field => (
				<DataCell
					key={field}
					width={getColumnWidth(field, widths)}
					value={getCellText(item, field, searchData.masked_fields)}
					linkHref={linkField === field ? rowLink : undefined}
					hint={hints?.[field]}
					isSelected={isRowSelected}
					allowRowMovement={allowRowMovement}
				/>
			))}
			{allowColumnResizing ? (
				<Table.Td
					className={clsx(classes.fillerColumn, { [classes.selectedCell]: isRowSelected })}
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
					searchData={searchData}
					isRowSelected={Boolean(selectedRows[rowIndex])}
					widths={context.cw.widths}
					hints={context.settings.fieldRenderHint}
					linkField={context.settings.linkField}
					linkRoutePath={context.settings.linkRoutePath}
					selectionColumn={context.settings.selectionColumn}
					allowRowMovement={context.settings.allowRowMovement}
					allowColumnResizing={context.settings.allowColumnResizing}
					rowMove={context.rowMove}
					onRowMouseDown={context.handlers.onRowMouseDown}
					onRowMouseEnter={context.handlers.onRowMouseEnter}
					onToggleRow={idx => toggleRowSelection(context.rs, idx)}
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
	return (
		<Stack gap='md'>
			<Stack gap='xs'>
				<Text size='sm' fw={500}>Page size</Text>
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
				<Text size='sm' fw={500}>Table mode</Text>
				<Radio.Group onChange={props.onGridModeChange} value={props.gridMode}>
					<Stack gap='xs'>
						<Radio value='list' label='List' />
						<Radio value='grid' label='Grid' />
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
	fieldsSelectionGetterRef: React.MutableRefObject<(() => string[]) | null>,
	initialSelectedFieldNames: string[],
	draftPageSize: string,
	onDraftPageSizeChange: (value: string) => void,
	gridMode: string,
	onGridModeChange: (value: string) => void,
	onApply: () => void,
};

function ViewSettingsModalView(props: ViewSettingsModalViewProps): React.ReactNode {
	const modalStyles = {
		body: { height: 'calc(50vh - 60px)', overflow: 'auto' as const },
		content: { height: '50vh' },
		header: { height: '60px' },
		title: { fontWeight: 'bold' as const },
	};
	return (
		<Modal
			centered
			onClose={props.onClose}
			opened={props.opened}
			size='sm'
			styles={modalStyles}
			title='View settings'
		>
			<Stack h='100%'>
				<Tabs onChange={props.onActiveTabChange} style={{ flex: 1, overflow: 'auto' }} value={props.activeTab}>
					<Tabs.List>
						<Tabs.Tab value='fields-settings'>Fields</Tabs.Tab>
						<Tabs.Tab value='table-settings'>Table</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel pt='sm' value='fields-settings'>
						<TextInput
							onChange={event => props.onFieldSearchChange(event.currentTarget.value)}
							placeholder='Field search box'
							value={props.fieldSearch}
						/>
						<FieldsSettingsTable
							fields={props.filteredFields}
							fieldsPanelNonce={props.fieldsPanelNonce}
							initialSelectedFieldNames={props.initialSelectedFieldNames}
							selectionGetterRef={props.fieldsSelectionGetterRef}
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
						<Button onClick={props.onClose} variant='default'>Cancel</Button>
						<Button onClick={props.onApply}>Apply</Button>
					</Group>
				</Box>
			</Stack>
		</Modal>
	);
}

function ViewSettingsModal(props: ViewSettingsModalProps): React.ReactNode {
	const { opened, onClose, modelSchema, desiredFields } = props;
	const { searchRequest, setSearchRequest } = useDataTableContext();
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
			onActiveTabChange={setActiveTab}
			onApply={applyViewSettings}
			onClose={onClose}
			onDraftPageSizeChange={setDraftPageSize}
			onFieldSearchChange={setFieldSearch}
			onGridModeChange={setGridMode}
		/>
	);
}

function FieldsSettingsTable(props: {
	fields: string[],
	fieldsPanelNonce: number,
	initialSelectedFieldNames: string[],
	selectionGetterRef: React.MutableRefObject<(() => string[]) | null>,
}): React.ReactNode {
	return (
		<div className='mt-2' key={props.fieldsPanelNonce}>
			<DataTable
				allowColumnResizing={true}
				allowRowMovement
				data={createFieldsSearchData(props.fields)}
				fieldsSettingsSelectionGetterRef={props.selectionGetterRef}
				initialSelectedFieldNames={props.initialSelectedFieldNames}
				isFullWidthTable
				selectionColumn='checkbox'
				showControls={false}
				tableName='Fields'
			/>
		</div>
	);
}

function createFieldsSearchData(fields: string[]): SearchData {
	return {
		page: 0,
		size: Math.max(fields.length, 1),
		total: fields.length,
		items: fields.map((field, index) => ({ id: `${field}-${index}`, field })),
		desired_fields: ['field'],
		masked_fields: [],
		schema_etag: '',
	} as SearchData;
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


function ActionButton({ action }: { action: DataTableActionHook }): React.ReactNode {
	return (
		<Button variant='outline' size='compact-md' leftSection={action.icon}>
			{action.label}
		</Button>
	);
}

function ActionMenu({ items }: { items: DataTableActionHook[] }): React.ReactNode {
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
					: <Menu.Item key={i} leftSection={item.icon}>{item.label}</Menu.Item>
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
	const onKeyDown = useKeyDownHandler(args);
	return {
		onStartResize, onAutoResize, onToggleAll,
		onRowMouseDown, onRowMouseEnter, onKeyDown,
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
	return React.useCallback((event: React.MouseEvent<HTMLButtonElement>, rowIndex: number) => {
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
