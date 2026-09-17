import { ActionIcon, Group, Menu, Table } from '@mantine/core';
import { IconDots, IconHash, IconTriangleFilled, IconTriangleInvertedFilled } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';

import { getFieldSchema } from './cells/cellValues';
import { useExcelDataTableContext } from './context';
import classes from './ExcelDataTable.module.css';
import { ColumnFilterRow } from './filter/ColumnFilterRow';
import { getFilterInputKind } from './filter/filterModel';
import { TableColGroup, getTableStyle, useColumnResize, useHeaderScrollSync } from './tableLayout';
import { useTranslate } from '../../i18n';


import type * as dyn from '@nikkierp/common/dynamicModel';


export type TableHeaderProps = {
	/** Off to hide the resize handles; widths still come from storage. */
	allowColumnResizing?: boolean,
	/** Off to drop the per-column filter row. */
	enableColumnFilters?: boolean,
	className?: string,
};

/**
 * The header block: field labels (sort, resize), the column filter row, and a 2px progress row
 * shown while data loads. Rendered apart from `Table` so a sticky panel can hold it; the two
 * share column widths through context and horizontal scroll through `scrollSync`.
 */
export function TableHeader({ allowColumnResizing = true, enableColumnFilters = true, className }: TableHeaderProps) {
	const context = useExcelDataTableContext();
	const { fields, columnWidths, isLoading, tid } = context;
	const scrollerRef = useHeaderScrollSync();
	const sort = useHeaderSort();
	const resize = useColumnResize();
	return (
		<div ref={scrollerRef} className={clsx(classes.headerScroller, className)}>
			<Table withTableBorder withColumnBorders style={getTableStyle(fields, columnWidths.widths)}>
				<TableColGroup fields={fields} widths={columnWidths.widths} />
				<Table.Thead>
					<Table.Tr>
						<Table.Th className={classes.rowNumberCell} aria-hidden><IconHash size={14} /></Table.Th>
						{fields.map(field => (
							<ColumnHeader
								key={field}
								field={field}
								sortDirection={sort.orderMap.get(field)}
								sortable={sort.sortableFields.has(field)}
								onSort={sort.onSort}
								allowColumnResizing={allowColumnResizing}
								{...resize}
							/>
						))}
						<Table.Th aria-hidden />
					</Table.Tr>
					{enableColumnFilters ? <ConnectedColumnFilterRow /> : null}
					<Table.Tr aria-hidden={!isLoading}>
						<Table.Td colSpan={fields.length + 2} className={classes.progressRow} {...tid.loading()}>
							{isLoading ? <div role='progressbar' aria-busy className={classes.progressBar} /> : null}
						</Table.Td>
					</Table.Tr>
				</Table.Thead>
			</Table>
		</div>
	);
}

/**
 * A column is sortable only if the server can order by it: it must own a database column.
 * A header click replaces the whole order and applies at once, writing the same state the sort
 * pane edits, so reopening the panel shows the sort the user just chose.
 */
function useHeaderSort() {
	const { fields, modelSchema, relatedSchemas, filters, applyFilters } = useExcelDataTableContext();
	const sortableFields = React.useMemo(() => new Set(fields.filter(
		field => getFieldSchema(modelSchema, field, relatedSchemas)?.is_persisted !== false,
	)), [fields, modelSchema, relatedSchemas]);
	const { setSortSingle, orderBy } = filters;
	const onSort = React.useCallback((field: string, direction: dyn.SearchOrder) => {
		setSortSingle(field, direction);
		applyFilters({ orderBy: [[field, direction]] });
	}, [setSortSingle, applyFilters]);
	const orderMap = React.useMemo(() => new Map(orderBy.map(([field, direction]) => [field, direction])), [orderBy]);
	return { sortableFields, onSort, orderMap };
}

function ConnectedColumnFilterRow() {
	const t = useTranslate('common');
	const ctx = useExcelDataTableContext();
	const { fields, modelSchema, relatedSchemas, filters, applyFilters, fieldRenderers } = ctx;
	const tField = useTranslate(ctx.translationNs);
	const translateEnumValue = React.useCallback((field: string, value: string) => {
		const renderer = fieldRenderers[field];
		return renderer?.translationKey && value !== '' ? tField(renderer.translationKey(value)) : value;
	}, [fieldRenderers, tField]);
	// Committing a cell is already an explicit act (Enter, or picking from a select), so it
	// applies at once rather than waiting for the panel's Apply.
	const onCommit = React.useCallback((field: string, value: string) => {
		const fieldSchema = getFieldSchema(modelSchema, field, relatedSchemas);
		applyFilters({ tree: filters.commitColumnValue(field, value, getFilterInputKind(fieldSchema)) });
	}, [applyFilters, filters, modelSchema, relatedSchemas]);
	return (
		<ColumnFilterRow
			fields={fields}
			modelSchema={modelSchema}
			relatedSchemas={relatedSchemas}
			values={filters.columnText}
			onChange={filters.setColumnValue}
			onCommit={onCommit}
			hasFillerColumn
			placeholder={t('search.placeholder')}
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
