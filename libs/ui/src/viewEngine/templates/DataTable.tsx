import {
	Anchor,
	Box,
	Button,
	ButtonGroup,
	Checkbox,
	Group,
	Input,
	Menu,
	Modal,
	Radio,
	Stack,
	Table,
	Tabs,
	TextInput,
	Title,
} from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamic_model';
import {
	IconChevronLeft, IconChevronRight, IconDots, IconSettings, IconX,
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
	useThunkHook?: () => ThunkPackHookReturn<any, any>,
};

export interface IFieldRenderHint {
	readonly type: string;
	render(value: string): React.ReactNode;
}

export type FieldRenderHintMap = Record<string, IFieldRenderHint>;

type SearchItem = Record<string, any>;
export type SearchData = dyn.RestSearchResponse<SearchItem>;

type CellPosition = { rowIndex: number, colIndex: number };
type CellSelection = { anchor: CellPosition | null, focus: CellPosition | null };
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

export type RenderTableNameArgs = { name: string, total: number };
export type RenderTableNameFn = (args: RenderTableNameArgs) => React.ReactNode;

export type DataTableProps = {
	tableName: string,
	searchData: SearchData,
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
	allowCellSelection?: boolean,
	renderTableName?: RenderTableNameFn,
};

type RequiredDataTableProps = Omit<
	DataTableProps,
	'actions' | 'allowColumnResizing' | 'isFullWidthTable' | 'selectionColumn'
	| 'allowRowMovement' | 'showControls' | 'allowCellSelection'
> & {
	actions: DataTableActionHook[],
	allowColumnResizing: boolean,
	isFullWidthTable: boolean,
	selectionColumn: SelectionColumn,
	allowRowMovement: boolean,
	showControls: boolean,
	allowCellSelection: boolean,
};

export function DataTable(props: DataTableProps): React.ReactNode {
	const settings = withDataTableDefaults(props);
	const [isViewSettingsOpen, setIsViewSettingsOpen] = React.useState(false);
	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const cw = useColumnWidthsState(settings.searchData.desired_fields);
	const rowMove = useRowMoveState(settings.searchData.items, settings.allowRowMovement, settings.onRowMoved);
	const tableSearchData = React.useMemo(
		() => ({ ...settings.searchData, items: rowMove.items, total: rowMove.items.length }),
		[rowMove.items, settings.searchData],
	);
	const rs = useRowSelectionState(tableSearchData.items.length);
	const cs = useCellSelectionState();
	const isRowMode = rs.indexes.length > 0;
	const handlers = useTableHandlers({
		searchData: tableSearchData,
		cw,
		rs,
		cs,
		isRowMode,
		allowCellSelection: settings.allowCellSelection,
		containerRef,
	});
	const tableWidth = getTablePixelWidth(tableSearchData.desired_fields, cw.widths, settings.selectionColumn);
	const tableStyle = settings.isFullWidthTable ? { width: '100%' as const } : getFixedTableStyle(tableWidth);
	return (
		<DataTableLayout
			props={settings}
			tableSearchData={tableSearchData}
			rs={rs}
			cs={cs}
			cw={cw}
			isRowMode={isRowMode}
			rowMove={rowMove}
			handlers={handlers}
			containerRef={containerRef}
			tableStyle={tableStyle}
			isViewSettingsOpen={isViewSettingsOpen}
			onOpenViewSettings={() => setIsViewSettingsOpen(true)}
			onCloseViewSettings={() => setIsViewSettingsOpen(false)}
		/>
	);
}

type DataTableLayoutProps = {
	props: RequiredDataTableProps,
	tableSearchData: SearchData,
	rs: ReturnType<typeof useRowSelectionState>,
	cs: ReturnType<typeof useCellSelectionState>,
	cw: ReturnType<typeof useColumnWidthsState>,
	isRowMode: boolean,
	rowMove: ReturnType<typeof useRowMoveState>,
	handlers: ReturnType<typeof useTableHandlers>,
	containerRef: React.RefObject<HTMLDivElement | null>,
	tableStyle: React.CSSProperties,
	isViewSettingsOpen: boolean,
	onOpenViewSettings: () => void,
	onCloseViewSettings: () => void,
};

function DataTableLayout(props: DataTableLayoutProps): React.ReactNode {
	return (
		<Stack gap='xs'>
			{props.props.showControls ? (
				<DataTableControls
					tableName={props.props.tableName}
					tableSearchData={props.tableSearchData}
					actions={props.props.actions}
					selectedCount={props.rs.indexes.length}
					onClearSelection={() => clearRowSelection(props.rs, props.cs)}
					onOpenViewSettings={props.onOpenViewSettings}
					renderTableName={props.props.renderTableName}
				/>
			) : null}
			<TableContainer
				props={props}
			/>
			{props.props.showControls ? (
				<ViewSettingsModal
					opened={props.isViewSettingsOpen}
					onClose={props.onCloseViewSettings}
					fields={props.props.searchData.desired_fields}
				/>
			) : null}
		</Stack>
	);
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
		allowCellSelection: props.allowCellSelection ?? true,
	};
}

type DataTableControlsProps = {
	tableName: string,
	tableSearchData: SearchData,
	actions: DataTableActionHook[],
	selectedCount: number,
	onClearSelection: () => void,
	onOpenViewSettings: () => void,
	renderTableName?: RenderTableNameFn,
};

function DataTableControls(props: DataTableControlsProps): React.ReactNode {
	return (
		<Group justify='space-between'>
			<Toolbar
				tableName={props.tableName}
				total={props.tableSearchData.total}
				actions={props.actions}
				selectedCount={props.selectedCount}
				onClearSelection={props.onClearSelection}
				renderTableName={props.renderTableName}
			/>
			<SearchBox fields={props.tableSearchData.desired_fields} />
			<Pagination searchData={props.tableSearchData} onOpenViewSettings={props.onOpenViewSettings} />
		</Group>
	);
}

function TableContainer({ props }: { props: DataTableLayoutProps }): React.ReactNode {
	return (
		<div
			ref={props.containerRef}
			tabIndex={0}
			onKeyDown={props.handlers.onKeyDown}
			className='outline-none overflow-x-auto'
		>
			<Table
				withTableBorder
				withColumnBorders
				striped='even'
				highlightOnHover
				style={props.tableStyle}
				className={clsx({ 'select-none': props.props.allowRowMovement })}
			>
				<DataTableHead
					fields={props.tableSearchData.desired_fields}
					widths={props.cw.widths}
					isRowMode={props.isRowMode}
					selectedCount={props.rs.indexes.length}
					rowCount={props.tableSearchData.items.length}
					selectionColumn={props.props.selectionColumn}
					allowColumnResizing={props.props.allowColumnResizing}
					onToggleAll={props.handlers.onToggleAll}
					onStartResize={props.handlers.onStartResize}
					onAutoResize={props.handlers.onAutoResize}
				/>
				<DataTableBody
					searchData={props.tableSearchData}
					widths={props.cw.widths}
					selectedRows={props.rs.rows}
					cellSelection={props.cs.selection}
					hints={props.props.fieldRenderHint}
					linkField={props.props.linkField}
					linkRoutePath={props.props.linkRoutePath}
					selectionColumn={props.props.selectionColumn}
					allowRowMovement={props.props.allowRowMovement}
					rowMove={props.rowMove}
					onRowMouseDown={props.handlers.onRowMouseDown}
					onRowMouseEnter={props.handlers.onRowMouseEnter}
					onToggleRow={idx => toggleRowSelection(props.rs, props.cs, idx)}
					onCellMouseDown={props.handlers.onCellMouseDown}
					onCellMouseEnter={props.handlers.onCellMouseEnter}
				/>
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
	const buttons = actions.slice(0, 2).filter(a => !a.isSeparator);
	const menuItems = actions.slice(2);
	const titleNode = renderTableName
		? renderTableName({ name: tableName, total: total ?? 0 })
		: <Title order={3}>{tableName} ({total ?? 0})</Title>;
	return (
		<Group gap='xs'>
			{titleNode}
			{selectedCount > 0 ? (
				<Button variant='light' onClick={onClearSelection} rightSection={<IconX size={14} />}>
					{selectedCount} selected
				</Button>
			) : (
				<>
					{buttons.map((action, i) => <ActionButton key={i} action={action} />)}
					{menuItems.length > 0 ? <ActionMenu items={menuItems} /> : null}
				</>
			)}
		</Group>
	);
}

function Pagination({
	searchData,
	onOpenViewSettings,
}: {
	searchData: SearchData,
	onOpenViewSettings: () => void,
}): React.ReactNode {
	const totalPages = Math.max(1, Math.ceil(searchData.total / searchData.size));
	return (
		<Group gap='xs' justify='flex-end'>
			<span>Page</span>
			<Input
				value={searchData.page} readOnly
				size='sm' w={50} classNames={{ input: 'text-center' }}
			/>
			<span>of {totalPages}</span>
			<ButtonGroup>
				<Button variant='outline' size='compact-md'><IconChevronLeft /></Button>
				<Button variant='outline' size='compact-md'><IconChevronRight /></Button>
			</ButtonGroup>
			<Button variant='outline' size='compact-md' onClick={onOpenViewSettings}>
				<IconSettings />
			</Button>
		</Group>
	);
}

function getPathStorageKey(): string {
	return typeof window === 'undefined' ? '' : window.location.pathname;
}

function createDefaultWidths(fields: string[]): ColumnWidths {
	return Object.fromEntries(fields.map(field => [field, defaultColumnWidth]));
}

function readStoredWidths(fields: string[]): ColumnWidths {
	const fallback = createDefaultWidths(fields);
	if (typeof window === 'undefined') {
		return fallback;
	}
	const raw = window.localStorage.getItem(getPathStorageKey());
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
		window.localStorage.setItem(getPathStorageKey(), JSON.stringify(widths));
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

function getTablePixelWidth(fields: string[], widths: ColumnWidths, selectionColumn: SelectionColumn): number {
	const dataWidth = fields.reduce((sum, field) => sum + getColumnWidth(field, widths), 0);
	return getSelectionColumnWidth(selectionColumn) + dataWidth;
}

function getColumnStyle(width: number): React.CSSProperties {
	return { width, minWidth: width, maxWidth: width };
}

function getFixedTableStyle(width: number): React.CSSProperties {
	return { width, minWidth: width, maxWidth: width };
}

function clearRowSelection(
	rs: ReturnType<typeof useRowSelectionState>,
	cs: ReturnType<typeof useCellSelectionState>,
): void {
	rs.setRows({});
	rs.setAnchor(null);
	cs.setSelection({ anchor: null, focus: null });
}

function toggleRowSelection(
	rs: ReturnType<typeof useRowSelectionState>,
	cs: ReturnType<typeof useCellSelectionState>,
	rowIndex: number,
): void {
	cs.setSelection({ anchor: null, focus: null });
	const next = !rs.rows[rowIndex];
	rs.setRows(prev => ({ ...prev, [rowIndex]: next }));
	rs.setAnchor(rowIndex);
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

function getSelectionBounds(anchor: CellPosition, focus: CellPosition) {
	return {
		startRow: Math.min(anchor.rowIndex, focus.rowIndex),
		endRow: Math.max(anchor.rowIndex, focus.rowIndex),
		startCol: Math.min(anchor.colIndex, focus.colIndex),
		endCol: Math.max(anchor.colIndex, focus.colIndex),
	};
}

function isCellInSelection(rowIndex: number, colIndex: number, sel: CellSelection): boolean {
	if (!sel.anchor || !sel.focus) {
		return false;
	}
	const bounds = getSelectionBounds(sel.anchor, sel.focus);
	return rowIndex >= bounds.startRow && rowIndex <= bounds.endRow
		&& colIndex >= bounds.startCol && colIndex <= bounds.endCol;
}

function getNextFocusCell(key: string, focus: CellPosition, rows: number, cols: number) {
	if (key === 'ArrowUp') {
		return { rowIndex: Math.max(0, focus.rowIndex - 1), colIndex: focus.colIndex };
	}
	if (key === 'ArrowDown') {
		return { rowIndex: Math.min(rows - 1, focus.rowIndex + 1), colIndex: focus.colIndex };
	}
	if (key === 'ArrowLeft') {
		return { rowIndex: focus.rowIndex, colIndex: Math.max(0, focus.colIndex - 1) };
	}
	if (key === 'ArrowRight') {
		return { rowIndex: focus.rowIndex, colIndex: Math.min(cols - 1, focus.colIndex + 1) };
	}
	return null;
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

function rowsFromCellSelection(searchData: SearchData, sel: CellSelection): string[][] {
	if (!sel.anchor || !sel.focus) {
		return [];
	}
	const b = getSelectionBounds(sel.anchor, sel.focus);
	const rows: string[][] = [];
	for (let r = b.startRow; r <= b.endRow; r += 1) {
		const item = searchData.items[r];
		const cells: string[] = [];
		for (let c = b.startCol; c <= b.endCol; c += 1) {
			cells.push(getCellText(item, searchData.desired_fields[c], searchData.masked_fields));
		}
		rows.push(cells);
	}
	return rows;
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

function useCellSelectionState() {
	const [selection, setSelection] = React.useState<CellSelection>({ anchor: null, focus: null });
	const [active, setActive] = React.useState(false);

	React.useEffect(() => {
		if (!active) {
			return undefined;
		}
		const onUp = () => setActive(false);
		window.addEventListener('mouseup', onUp);
		return () => window.removeEventListener('mouseup', onUp);
	}, [active]);

	return { selection, setSelection, active, setActive };
}

function useRowMoveState(
	inputItems: SearchItem[],
	enabled: boolean,
	onRowMoved?: (payload: RowMovePayload) => void,
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
		setItems(prev => {
			const fromIndex = state.draggingIndex ?? -1;
			const next = enabled ? moveRow(prev, fromIndex, targetIndex) : prev;
			if (enabled && fromIndex >= 0 && fromIndex !== targetIndex) {
				onRowMoved?.({ fromIndex, toIndex: targetIndex, items: next });
			}
			return next;
		});
		setState({ draggingIndex: null, dropIndex: null });
	}, [enabled, onRowMoved, state.draggingIndex]);

	const cancel = React.useCallback(() => {
		setState({ draggingIndex: null, dropIndex: null });
	}, []);

	return { items, state, startDragging, dragOver, drop, cancel };
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
			className='p-0 text-center align-middle'
			style={getColumnStyle(columnWidth)}
			onClick={isCheckbox ? undefined : props.onToggle}
		>
			{isCheckbox ? (
				<Checkbox
					checked={props.isRowMode}
					indeterminate={isIndeterminate}
					onChange={props.onToggle}
					onClick={event => event.stopPropagation()}
					aria-label='Select all rows'
				/>
			) : (props.isRowMode ? 'x' : '#')}
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
			className={
				'absolute top-0 right-0 w-2 h-full cursor-col-resize bg-blue-500/20 '
				+ 'opacity-0 hover:opacity-100 transition-opacity'
			}
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
		<Table.Th className='relative' style={getColumnStyle(props.width)}>
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

type DataTableHeadProps = {
	fields: string[],
	widths: ColumnWidths,
	isRowMode: boolean,
	selectedCount: number,
	rowCount: number,
	selectionColumn: SelectionColumn,
	allowColumnResizing: boolean,
	onToggleAll: () => void,
	onStartResize: ResizeHandleProps['onStartResize'],
	onAutoResize: ResizeHandleProps['onAutoResize'],
};

function DataTableHead(props: DataTableHeadProps): React.ReactNode {
	return (
		<Table.Thead>
			<Table.Tr>
				<RowNumberHeader
					isRowMode={props.isRowMode}
					selectedCount={props.selectedCount}
					rowCount={props.rowCount}
					selectionColumn={props.selectionColumn}
					onToggle={props.onToggleAll}
				/>
				{props.fields.map(field => (
					<ColumnHeader
						key={field}
						field={field}
						width={getColumnWidth(field, props.widths)}
						allowColumnResizing={props.allowColumnResizing}
						onStartResize={props.onStartResize}
						onAutoResize={props.onAutoResize}
					/>
				))}
			</Table.Tr>
		</Table.Thead>
	);
}

type RowNumberCellProps = {
	rowIndex: number,
	rowNumber: number,
	isSelected: boolean,
	selectionColumn: SelectionColumn,
	onMouseDown: (e: React.MouseEvent<HTMLTableCellElement>, idx: number) => void,
	onMouseEnter: (idx: number) => void,
	onToggle: (idx: number) => void,
};

function RowNumberCell(props: RowNumberCellProps): React.ReactNode {
	const isCheckbox = props.selectionColumn === 'checkbox';
	const columnWidth = getSelectionColumnWidth(props.selectionColumn);
	const displayValue = props.selectionColumn === 'checkbox'
		? (
			<Checkbox
				checked={props.isSelected}
				onChange={() => props.onToggle(props.rowIndex)}
				onClick={event => event.stopPropagation()}
				aria-label={`Select row ${props.rowNumber}`}
			/>
		)
		: props.rowNumber;
	return (
		<Table.Td
			p={0}
			onMouseEnter={() => props.onMouseEnter(props.rowIndex)}
			onMouseDown={isCheckbox ? undefined : (e => props.onMouseDown(e, props.rowIndex))}
			className={clsx(
				'text-center align-middle',
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
	field: string,
	width: number,
	value: string,
	linkHref?: string,
	hint?: IFieldRenderHint,
	isSelected: boolean,
	allowRowMovement?: boolean,
	rowIndex: number,
	colIndex: number,
	onMouseDown: (e: React.MouseEvent<HTMLTableCellElement>, r: number, c: number) => void,
	onMouseEnter: (r: number, c: number) => void,
};

function DataCell(props: DataCellProps): React.ReactNode {
	const content = props.hint ? props.hint.render(props.value) : props.value;
	return (
		<Table.Td
			onMouseDown={e => props.onMouseDown(e, props.rowIndex, props.colIndex)}
			onMouseEnter={() => props.onMouseEnter(props.rowIndex, props.colIndex)}
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
					className='block overflow-hidden text-ellipsis whitespace-nowrap'
				>
					{content}
				</Anchor>
			) : <div className='overflow-hidden text-ellipsis whitespace-nowrap' title={props.value}>{content}</div>}
		</Table.Td>
	);
}

type BodyRowProps = {
	item: SearchItem,
	rowIndex: number,
	searchData: SearchData,
	widths: ColumnWidths,
	isRowSelected: boolean,
	cellSelection: CellSelection,
	hints?: FieldRenderHintMap,
	linkField?: string,
	linkRoutePath?: string,
	selectionColumn: SelectionColumn,
	allowRowMovement: boolean,
	rowMove: ReturnType<typeof useRowMoveState>,
	onRowMouseDown: RowNumberCellProps['onMouseDown'],
	onRowMouseEnter: RowNumberCellProps['onMouseEnter'],
	onToggleRow: RowNumberCellProps['onToggle'],
	onCellMouseDown: DataCellProps['onMouseDown'],
	onCellMouseEnter: DataCellProps['onMouseEnter'],
};

function BodyRow(props: BodyRowProps): React.ReactNode {
	const {
		item,
		rowIndex,
		searchData,
		widths,
		isRowSelected,
		cellSelection,
		hints,
		linkField,
		linkRoutePath,
		selectionColumn,
		allowRowMovement,
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
			style={showDropIndicator ? { boxShadow: 'inset 0 2px 0 var(--mantine-color-blue-6)' } : undefined}
		>
			<RowNumberCell
				rowIndex={rowIndex} rowNumber={rowNumber} isSelected={isRowSelected}
				selectionColumn={selectionColumn}
				onMouseDown={props.onRowMouseDown}
				onMouseEnter={props.onRowMouseEnter}
				onToggle={props.onToggleRow}
			/>
			{searchData.desired_fields.map((field, colIndex) => (
				<DataCell
					key={field} field={field}
					width={getColumnWidth(field, widths)}
					value={getCellText(item, field, searchData.masked_fields)}
					linkHref={linkField === field ? rowLink : undefined}
					hint={hints?.[field]}
					isSelected={isRowSelected || isCellInSelection(rowIndex, colIndex, cellSelection)}
					allowRowMovement={allowRowMovement}
					rowIndex={rowIndex} colIndex={colIndex}
					onMouseDown={props.onCellMouseDown} onMouseEnter={props.onCellMouseEnter}
				/>
			))}
		</Table.Tr>
	);
}

type DataTableBodyProps = Omit<BodyRowProps, 'item' | 'rowIndex' | 'isRowSelected'> & {
	selectedRows: RowSelection,
};

function DataTableBody(props: DataTableBodyProps): React.ReactNode {
	const { searchData, selectedRows, ...rest } = props;
	return (
		<Table.Tbody>
			{searchData.items.map((item, rowIndex) => (
				<BodyRow
					key={item.id ?? rowIndex}
					item={item}
					rowIndex={rowIndex}
					searchData={searchData}
					isRowSelected={Boolean(selectedRows[rowIndex])}
					{...rest}
				/>
			))}
		</Table.Tbody>
	);
}

type ViewSettingsModalProps = {
	opened: boolean,
	onClose: () => void,
	fields: string[],
};

function ViewSettingsModal({ opened, onClose, fields }: ViewSettingsModalProps): React.ReactNode {
	const [activeTab, setActiveTab] = React.useState<string | null>('fields');
	const [fieldSearch, setFieldSearch] = React.useState('');
	const [gridMode, setGridMode] = React.useState('list');
	const filteredFields = React.useMemo(() => filterFields(fields, fieldSearch), [fieldSearch, fields]);
	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title='View settings'
			centered
			size='lg'
			styles={{ content: { height: '80vh' }, body: { height: 'calc(80vh - 56px)', overflow: 'auto' } }}
		>
			<Stack h='100%'>
				<Tabs value={activeTab} onChange={setActiveTab} style={{ flex: 1, overflow: 'auto' }}>
					<Tabs.List>
						<Tabs.Tab value='fields'>Fields</Tabs.Tab>
						<Tabs.Tab value='grid-mode'>Grid mode</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel value='fields' pt='sm'>
						<TextInput
							value={fieldSearch}
							onChange={event => setFieldSearch(event.currentTarget.value)}
							placeholder='Field search box'
						/>
						<FieldsSettingsTable fields={filteredFields} />
					</Tabs.Panel>
					<Tabs.Panel value='grid-mode' pt='sm'>
						<Radio.Group value={gridMode} onChange={setGridMode}>
							<Stack gap='xs'>
								<Radio value='list' label='List' />
								<Radio value='grid' label='Grid' />
							</Stack>
						</Radio.Group>
					</Tabs.Panel>
				</Tabs>
				<Box className='border-t border-gray-300 pt-3 mt-auto'>
					<Group justify='flex-end'>
						<Button variant='default' onClick={onClose}>Cancel</Button>
						<Button onClick={onClose}>Apply</Button>
					</Group>
				</Box>
			</Stack>
		</Modal>
	);
}

function FieldsSettingsTable({ fields }: { fields: string[] }): React.ReactNode {
	return (
		<div className='mt-2'>
			<DataTable
				tableName='Fields'
				searchData={createFieldsSearchData(fields)}
				selectionColumn='checkbox'
				isFullWidthTable
				showControls={false}
				allowColumnResizing={false}
				allowRowMovement
				allowCellSelection={false}
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
	cs: ReturnType<typeof useCellSelectionState>,
	isRowMode: boolean,
	allowCellSelection: boolean,
	containerRef: React.RefObject<HTMLDivElement | null>,
};

function useTableHandlers(args: TableHandlersArgs) {
	const onStartResize = useResizeHandler(args.cw);
	const onAutoResize = useAutoResizeHandler(args.searchData, args.cw);
	const onToggleAll = useToggleAllHandler(args.searchData, args.rs, args.cs);
	const onRowMouseDown = useRowMouseDownHandler(args.rs, args.cs);
	const onRowMouseEnter = useRowMouseEnterHandler(args.rs);
	const onCellMouseDown = useCellMouseDownHandler(
		args.cs,
		args.isRowMode,
		args.allowCellSelection,
		args.containerRef,
	);
	const onCellMouseEnter = useCellMouseEnterHandler(args.cs, args.isRowMode, args.allowCellSelection);
	const onKeyDown = useKeyDownHandler(args);
	return {
		onStartResize, onAutoResize, onToggleAll,
		onRowMouseDown, onRowMouseEnter, onCellMouseDown, onCellMouseEnter, onKeyDown,
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

function useAutoResizeHandler(searchData: SearchData, cw: ReturnType<typeof useColumnWidthsState>) {
	return React.useCallback((field: string) => {
		const next = getAutoColumnWidth(field, searchData);
		cw.setWidths(prev => ({ ...prev, [field]: next }));
	}, [cw, searchData]);
}

function useToggleAllHandler(
	searchData: SearchData,
	rs: ReturnType<typeof useRowSelectionState>,
	cs: ReturnType<typeof useCellSelectionState>,
) {
	return React.useCallback(() => {
		cs.setSelection({ anchor: null, focus: null });
		if (rs.indexes.length > 0) {
			rs.setRows({});
			rs.setAnchor(null);
			return;
		}
		rs.setRows(buildAllRowSelection(searchData.items.length));
		rs.setAnchor(0);
	}, [cs, rs, searchData.items.length]);
}

function useRowMouseDownHandler(
	rs: ReturnType<typeof useRowSelectionState>,
	cs: ReturnType<typeof useCellSelectionState>,
) {
	return React.useCallback((event: React.MouseEvent<HTMLTableCellElement>, rowIndex: number) => {
		event.preventDefault();
		event.stopPropagation();
		cs.setSelection({ anchor: null, focus: null });
		if (event.shiftKey && rs.anchor !== null) {
			rs.setRows(buildRangeRowSelection(rs.anchor, rowIndex));
			return;
		}
		const next = !rs.rows[rowIndex];
		rs.setRows(prev => ({ ...prev, [rowIndex]: next }));
		rs.setAnchor(rowIndex);
		rs.setDrag({ isActive: true, targetSelected: next });
	}, [cs, rs]);
}

function useRowMouseEnterHandler(rs: ReturnType<typeof useRowSelectionState>) {
	return React.useCallback((rowIndex: number) => {
		if (!rs.drag.isActive) {
			return;
		}
		rs.setRows(prev => ({ ...prev, [rowIndex]: rs.drag.targetSelected }));
	}, [rs]);
}

function useCellMouseDownHandler(
	cs: ReturnType<typeof useCellSelectionState>,
	isRowMode: boolean,
	allowCellSelection: boolean,
	containerRef: React.RefObject<HTMLDivElement | null>,
) {
	return React.useCallback((event: React.MouseEvent<HTMLTableCellElement>, r: number, c: number) => {
		if (isRowMode || !allowCellSelection) {
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		const clicked = { rowIndex: r, colIndex: c };
		cs.setSelection(prev => (event.shiftKey && prev.anchor
			? { anchor: prev.anchor, focus: clicked }
			: { anchor: clicked, focus: clicked }));
		cs.setActive(true);
		containerRef.current?.focus();
	}, [allowCellSelection, cs, containerRef, isRowMode]);
}

function useCellMouseEnterHandler(
	cs: ReturnType<typeof useCellSelectionState>,
	isRowMode: boolean,
	allowCellSelection: boolean,
) {
	return React.useCallback((r: number, c: number) => {
		if (!allowCellSelection || !cs.active || isRowMode) {
			return;
		}
		cs.setSelection(prev => ({ anchor: prev.anchor, focus: { rowIndex: r, colIndex: c } }));
	}, [allowCellSelection, cs, isRowMode]);
}

function useKeyDownHandler(args: TableHandlersArgs) {
	const { searchData, cs, rs, isRowMode, allowCellSelection } = args;
	const handleCopy = useCopyHandler(args);
	const handleRowArrow = useRowArrowHandler(args);
	const handleCellArrow = useCellArrowHandler(args);
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
		if (isRowMode || !allowCellSelection || !cs.selection.anchor || !cs.selection.focus) {
			return;
		}
		handleCellArrow(event);
	}, [
		allowCellSelection,
		cs.selection,
		handleCellArrow,
		handleCopy,
		handleRowArrow,
		isRowMode,
		rs.indexes,
		searchData,
	]);
}

function useCopyHandler({ searchData, cs, rs, isRowMode, allowCellSelection }: TableHandlersArgs) {
	return React.useCallback(async () => {
		const rows = isRowMode
			? rowsFromRowSelection(searchData, rs.indexes)
			: (allowCellSelection ? rowsFromCellSelection(searchData, cs.selection) : []);
		await copyToClipboard(rows);
	}, [allowCellSelection, cs.selection, isRowMode, rs.indexes, searchData]);
}

function useRowArrowHandler({ searchData, rs, cs }: TableHandlersArgs) {
	return React.useCallback((key: string) => {
		const current = rs.indexes[0];
		const target = key === 'ArrowUp' ? current - 1 : current + 1;
		const safe = Math.max(0, Math.min(searchData.items.length - 1, target));
		rs.setRows({ [safe]: true });
		rs.setAnchor(safe);
		cs.setSelection({ anchor: null, focus: null });
	}, [cs, rs, searchData.items.length]);
}

function useCellArrowHandler({ searchData, cs }: TableHandlersArgs) {
	return React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
		if (!cs.selection.anchor || !cs.selection.focus) {
			return;
		}
		const next = getNextFocusCell(
			event.key, cs.selection.focus,
			searchData.items.length, searchData.desired_fields.length,
		);
		if (!next) {
			return;
		}
		event.preventDefault();
		cs.setSelection(event.shiftKey
			? { anchor: cs.selection.anchor, focus: next }
			: { anchor: next, focus: next });
	}, [cs, searchData]);
}
