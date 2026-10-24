import { ActionIcon, Checkbox, Group, Menu, Table, Tooltip } from '@mantine/core';
import { IconDots, IconTriangleFilled, IconTriangleInvertedFilled } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';

import { getFieldSchema } from './cells/cellValues';
import { useExcelDataTableContext } from './context';
import classes from './ExcelDataTable.module.css';
import { ColumnFilterRow } from './filter/ColumnFilterRow';
import { getFilterInputKind, isSortableFieldName } from './filter/filterModel';
import { selectionStateOf } from './selectionModel';
import {
	TableGeometryColGroup, useColumnCount, useColumnResize, useHeaderScrollSync, useTableGeometry,
} from './tableLayout';
import { tableScopeAttrs } from './tableScope';
import { useEnumValueLabel } from './useEnumValueLabel';
import { useTranslate } from '../../i18n';


import type * as dyn from '@nikkierp/common/dynamicModel';


export type TableHeaderProps = {
	/** Off to hide the resize handles; widths still come from storage. */
	allowColumnResizing?: boolean,
	/** Off to drop the per-column filter row. */
	enableColumnFilters?: boolean,
	/** Content of the trailing filler column's header, e.g. a toolbar for the row actions below it. */
	renderFillerColumnHeader?: () => React.ReactNode,
	/**
	 * The filler column never gets narrower than this: widening a field column grows the table
	 * (horizontal scroll) instead. Defaults to 0, a filler that may shrink away entirely.
	 */
	fillerColumnMinWidth?: number,
	className?: string,
};

/**
 * The header block: field labels (sort, resize), the column filter row, and a 2px progress row
 * shown while data loads. Rendered apart from `Table` so a sticky panel can hold it; the two
 * share column widths through context and horizontal scroll through `scrollSync`.
 */
export function TableHeader(props: TableHeaderProps) {
	const { allowColumnResizing = true, enableColumnFilters = true, fillerColumnMinWidth = 0 } = props;
	const { columnWidths, isLoading, tid, scopeId } = useExcelDataTableContext();
	const { setFillerMinWidth } = columnWidths;
	React.useEffect(() => setFillerMinWidth(fillerColumnMinWidth), [fillerColumnMinWidth, setFillerMinWidth]);
	const scrollerRef = useHeaderScrollSync();
	const geometry = useTableGeometry();
	const columnCount = useColumnCount();
	return (
		<div ref={scrollerRef} className={clsx(classes.headerScroller, props.className)} {...tableScopeAttrs(scopeId)}>
			<Table style={geometry.style}>
				<TableGeometryColGroup geometry={geometry} />
				<Table.Thead>
					<HeaderLabelsRow
						allowColumnResizing={allowColumnResizing}
						renderFillerColumnHeader={props.renderFillerColumnHeader}
					/>
					{enableColumnFilters ? <ConnectedColumnFilterRow /> : null}
					<Table.Tr aria-hidden={!isLoading}>
						<Table.Td colSpan={columnCount} className={classes.progressRow} {...tid.loading()}>
							{isLoading ? <div role='progressbar' aria-busy className={classes.progressBar} /> : null}
						</Table.Td>
					</Table.Tr>
				</Table.Thead>
			</Table>
		</div>
	);
}

type HeaderLabelsRowProps = Pick<TableHeaderProps, 'renderFillerColumnHeader'> & { allowColumnResizing: boolean };

function HeaderLabelsRow({ allowColumnResizing, renderFillerColumnHeader }: HeaderLabelsRowProps) {
	const { columns, indexColumnVisible, manualSort, tid } = useExcelDataTableContext();
	const sort = useHeaderSort();
	const resize = useColumnResize();
	const filler = renderFillerColumnHeader?.();
	return (
		<Table.Tr>
			{indexColumnVisible ? <SelectAllHeaderCell /> : null}
			{manualSort.enabled ? (
				// A label-less header still takes the header background, or it reads as a hole in the row.
				<Table.Th className={clsx(classes.headerCell, classes.sortHandleCell)} aria-hidden />
			) : null}
			{columns.map(column => (column.kind === 'action' ? (
				<Table.Th
					key={column.key}
					className={classes.headerCell}
					{...tid.actionColumnHeader(column.column.key)}
				>
					<span className='overflow-hidden text-ellipsis whitespace-nowrap'>{column.column.label}</span>
				</Table.Th>
			) : (
				<ColumnHeader
					key={column.key}
					field={column.field}
					sortDirection={sort.orderMap.get(column.field)}
					sortable={sort.sortableFields.has(column.field)}
					onSort={sort.onSort}
					allowColumnResizing={allowColumnResizing}
					{...resize}
				/>
			)))}
			<Table.Th className={classes.fillerHeaderCell} aria-hidden={filler ? undefined : true}>
				{filler}
			</Table.Th>
		</Table.Tr>
	);
}

/**
 * The index column's header: a select-all over the rows loaded. The whole cell is the click target;
 * the checkbox's own click bubbles up to it, and stays focusable so Space toggles it too. Single
 * and none modes have nothing to select all of, so the cell stays empty there.
 */
function SelectAllHeaderCell() {
	const { selection, tid } = useExcelDataTableContext();
	const t = useTranslate('common');
	if (selection.mode !== 'multiple') {
		return <Table.Th className={classes.rowNumberCell} aria-hidden />;
	}
	const coverage = selectionStateOf(selection, selection.order);
	const disabled = !selection.isEnabled || selection.order.length === 0;
	const label = t('datatable.selectAll', { defaultValue: 'Select all' });
	return (
		<Tooltip label={label}>
			<Table.Th
				className={clsx('align-middle', classes.rowNumberCell, classes.selectAllCell)}
				data-disabled={disabled || undefined}
				onClick={disabled ? undefined : selection.toggleAll}
				{...tid.selectAll()}
			>
				<div className='flex justify-center'>
					<Checkbox
						size='xs'
						checked={coverage === 'all'}
						indeterminate={coverage === 'some'}
						disabled={disabled}
						aria-label={label}
						readOnly
					/>
				</div>
			</Table.Th>
		</Tooltip>
	);
}

/**
 * A column is sortable only if the server can order by it, which `is_sortable` says: a computed
 * field rendered in SQL qualifies, one filled in Go after the query does not. A header click
 * replaces the whole order and applies at once, writing the same state the sort pane edits, so
 * reopening the panel shows the sort the user just chose.
 */
function useHeaderSort() {
	const { fields, modelSchema, relatedSchemas, filters, applyFilters } = useExcelDataTableContext();
	const sortableFields = React.useMemo(
		() => new Set(fields.filter(field => isSortableFieldName(modelSchema, field, relatedSchemas))),
		[fields, modelSchema, relatedSchemas],
	);
	const { setSortSingle, orderBy } = filters;
	const onSort = React.useCallback((field: string, direction: dyn.SearchOrder) => {
		setSortSingle(field, direction);
		applyFilters({ orderBy: [[field, direction]] });
	}, [setSortSingle, applyFilters]);
	const orderMap = React.useMemo(() => new Map(orderBy.map(([field, direction]) => [field, direction])), [orderBy]);
	return { sortableFields, onSort, orderMap };
}

function ConnectedColumnFilterRow() {
	const ctx = useExcelDataTableContext();
	const { columns, modelSchema, relatedSchemas, filters, applyFilters } = ctx;
	const columnKeys = React.useMemo(() => columns.map(column => column.key), [columns]);
	const translateEnumValue = useEnumValueLabel();
	// Committing a cell is already an explicit act (Enter, or picking from a select), so it
	// applies at once rather than waiting for the panel's Apply.
	const onCommit = React.useCallback((field: string, value: string) => {
		const fieldSchema = getFieldSchema(modelSchema, field, relatedSchemas);
		applyFilters({ tree: filters.commitColumnValue(field, value, getFilterInputKind(fieldSchema)) });
	}, [applyFilters, filters, modelSchema, relatedSchemas]);
	return (
		<ColumnFilterRow
			fields={columnKeys}
			modelSchema={modelSchema}
			relatedSchemas={relatedSchemas}
			values={filters.columnText}
			onChange={filters.setColumnValue}
			onCommit={onCommit}
			hasFillerColumn
			hasIndexColumn={ctx.indexColumnVisible}
			hasSortHandleColumn={ctx.manualSort.enabled}
			translateEnumValue={translateEnumValue}
			tid={ctx.tid}
		/>
	);
}

type ColumnHeaderProps = {
	field: string,
	sortDirection?: dyn.SearchOrder,
	sortable: boolean,
	onSort: (field: string, direction: dyn.SearchOrder) => void,
	allowColumnResizing: boolean,
	onStartResize: (field: string, event: React.MouseEvent<HTMLDivElement>) => void,
	onAutoResize: (field: string) => void,
};

function ColumnHeader(props: ColumnHeaderProps) {
	const { tid, translateFieldName } = useExcelDataTableContext();
	return (
		<Table.Th className={classes.headerCell} {...tid.sort(props.field)}>
			<Group justify='space-between' gap={1} wrap='nowrap' className='overflow-hidden'>
				<span className='overflow-hidden text-ellipsis whitespace-nowrap'>{translateFieldName(props.field)}</span>
				<Group gap={2} wrap='nowrap' className='flex-shrink-0'>
					{props.sortable ? <ColumnHeaderMenu {...props} /> : null}
					{props.sortDirection === 'asc' ? <IconTriangleFilled size={8} /> : null}
					{props.sortDirection === 'desc' ? <IconTriangleInvertedFilled size={8} /> : null}
				</Group>
			</Group>
			{props.allowColumnResizing ? (
				<div
					role='separator'
					aria-label={`Resize ${props.field}`}
					onMouseDown={event => props.onStartResize(props.field, event)}
					onDoubleClick={() => props.onAutoResize(props.field)}
					className={classes.resizeHandle}
				/>
			) : null}
		</Table.Th>
	);
}

/**
 * The per-column `[...]` sort menu, revealed on header hover. Stays mounted while closed and
 * hides with opacity, so the header never reflows when the pointer crosses it.
 */
function ColumnHeaderMenu(props: Pick<ColumnHeaderProps, 'field' | 'sortDirection' | 'onSort'>) {
	const [opened, setOpened] = React.useState(false);
	const { tid } = useExcelDataTableContext();
	const t = useTranslate('common');
	return (
		<Menu opened={opened} onChange={setOpened} position='bottom-end' withinPortal shadow='sm'>
			<Menu.Target>
				<ActionIcon
					variant='subtle'
					size='xs'
					color='gray'
					className={classes.headerMenuButton}
					data-open={opened ? 'true' : undefined}
					onClick={event => event.stopPropagation()}
					aria-label={t('search.sort')}
					{...tid.headerMenu(props.field)}
				>
					<IconDots size={14} />
				</ActionIcon>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Item
					leftSection={<IconTriangleFilled size={8} />}
					disabled={props.sortDirection === 'asc'}
					onClick={() => props.onSort(props.field, 'asc')}
					{...tid.headerMenuSort(props.field, 'asc')}
				>
					{t('search.sortAtoZ')}
				</Menu.Item>
				<Menu.Item
					leftSection={<IconTriangleInvertedFilled size={8} />}
					disabled={props.sortDirection === 'desc'}
					onClick={() => props.onSort(props.field, 'desc')}
					{...tid.headerMenuSort(props.field, 'desc')}
				>
					{t('search.sortZtoA')}
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
}
