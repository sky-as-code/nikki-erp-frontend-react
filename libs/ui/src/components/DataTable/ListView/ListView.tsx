import { ActionIcon, Anchor, Group, Menu, Table } from '@mantine/core';
import * as dyn from '@nikkierp/common/dynamicModel';
import {
	IconDots, IconHash, IconX, IconTriangleFilled, IconTriangleInvertedFilled,
} from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { Link, useResolvedPath } from 'react-router-dom';

import { getColumnStyle, getColumnWidth, rowNumberColumnWidth } from './columnWidths';
import classes from './ListView.module.css';
import { useTranslate } from '../../../i18n';
import {
	getCellText, getRowNumber, isArrayField, renderDataCellContent, shouldUseSingleLineEllipsis,
} from '../cellValues';
import sharedClasses from '../DataTable.module.css';
import { useDataTableContext } from '../DataTableContext';
import { ColumnFilterRow, getFilterInputKind } from '../FilterBox';
import { rowTestIdOf } from '../testIds';

import type { RowId } from '../testIds';
import type { SearchItem } from '../types';
import type { IFieldRenderer } from '@nikkierp/viewengine/core';


/**
 * The rows-in-a-table view: the original `DataTable` body, unchanged in behaviour.
 *
 * It reads everything it needs from the table context, so swapping it for `GridView` is a
 * single conditional in the layout — the controls above and below it never move.
 */
export function ListView(): React.ReactNode {
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
				<ListViewHead />
				<ListViewBody />
			</Table>
		</div>
	);
}

type RowNumberOverlayButtonProps = {
	children: React.ReactNode,
	onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => void,
	'aria-label'?: string,
	'data-testid'?: string,
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
			data-testid={props['data-testid']}
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
	const { tid } = useDataTableContext();
	return (
		<Table.Th
			className='p-0 text-center align-middle relative'
			style={getColumnStyle(columnWidth)}
		>
			<RowNumberOverlayButton
				onMouseDown={() => props.onToggle()}
				aria-label={props.isRowMode ? 'Deselect all rows' : 'Select all rows'}
				{...tid.selectAll()}
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
	sortable: boolean,
	onSort: (field: string, direction: dyn.SearchOrder) => void,
	allowColumnResizing: boolean,
	translateFieldName: (field: string) => string,
	onStartResize: ResizeHandleProps['onStartResize'],
	onAutoResize: ResizeHandleProps['onAutoResize'],
};

type ColumnHeaderMenuProps = {
	field: string,
	sortDirection?: dyn.SearchOrder,
	onSort: (field: string, direction: dyn.SearchOrder) => void,
};

/**
 * The per-column `[...]` menu, revealed on header hover.
 *
 * Stays mounted while closed and hides with opacity rather than being conditionally rendered:
 * unmounting it would let the header reflow on hover, shifting the column label sideways every
 * time the pointer crosses it. It is also pinned visible while its own menu is open, so the
 * button does not vanish out from under the menu it spawned.
 */
function ColumnHeaderMenu(props: ColumnHeaderMenuProps): React.ReactNode {
	const [opened, setOpened] = React.useState(false);
	const { tid } = useDataTableContext();
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

function ColumnHeader(props: ColumnHeaderProps): React.ReactNode {
	const { tid } = useDataTableContext();
	return (
		<Table.Th
			style={getColumnStyle(props.width)}
			className={classes.resizeableHeader}
			{...tid.sort(props.field)}
		>
			<Group justify='space-between' gap={1} wrap='nowrap' className='overflow-hidden'>
				<span className='overflow-hidden text-ellipsis whitespace-nowrap'>{props.translateFieldName(props.field)}</span>
				<Group gap={2} wrap='nowrap' className='flex-shrink-0'>
					{props.sortable ? (
						<ColumnHeaderMenu
							field={props.field}
							sortDirection={props.sortDirection}
							onSort={props.onSort}
						/>
					) : null}
					{props.sortDirection === 'asc'
						? <IconTriangleFilled size={8} className={classes.sortIndicator} />
						: null}
					{props.sortDirection === 'desc'
						? <IconTriangleInvertedFilled size={8} className={classes.sortIndicator} />
						: null}
				</Group>
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

function ListViewHead(): React.ReactNode {
	const context = useDataTableContext();
	const t = useTranslate('common');
	const fields = context.tableSearchData.desired_fields;
	const widths = context.cw.widths;
	const modelSchema = context.settings.modelSchema;
	const commitColumnValue = context.filters.commitColumnValue;
	const applyColumnFilters = context.applyFilters;
	// Committing a cell is already an explicit act — Enter, or picking from a select — so it
	// applies at once rather than waiting for the panel's Apply. The condition it wrote is
	// visible in the panel either way.
	const onCommitColumnFilter = React.useCallback((field: string, value: string) => {
		const next = commitColumnValue(field, value, getFilterInputKind(modelSchema?.fields?.[field]));
		applyColumnFilters({ tree: next });
	}, [commitColumnValue, modelSchema, applyColumnFilters]);

	// A column is sortable only if the server can order by it: the caller's explicit list when
	// given, otherwise every visible field that owns a database column.
	const sortableFields = React.useMemo(() => {
		const declared = context.settings.sortableFields;
		if (declared) {
			return new Set(declared);
		}
		return new Set(fields.filter(
			field => modelSchema?.fields?.[field]?.is_persisted !== false,
		));
	}, [context.settings.sortableFields, fields, modelSchema]);

	// A header click replaces the whole order and applies at once. It writes the same state the
	// sort pane edits, so reopening the panel shows the sort the user just chose.
	const applyFilters = context.applyFilters;
	const setSortSingle = context.filters.setSortSingle;
	const onSort = React.useCallback((field: string, direction: dyn.SearchOrder) => {
		const next: dyn.OrderBy = [[field, direction]];
		setSortSingle(field, direction);
		applyFilters({ orderBy: next });
	}, [setSortSingle, applyFilters]);
	const orderBy = context.filters.orderBy;
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
						sortable={sortableFields.has(field)}
						onSort={onSort}
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
			{context.settings.enableColumnFilters ? (
				<ColumnFilterRow
					fields={fields}
					modelSchema={context.settings.modelSchema}
					values={context.filters.columnText}
					onChange={context.filters.setColumnValue}
					onCommit={onCommitColumnFilter}
					getColumnStyle={field => getColumnStyle(getColumnWidth(field, widths))}
					hasFillerColumn={context.settings.allowColumnResizing}
					placeholder={t('search.placeholder')}
					tid={context.tid}
				/>
			) : null}
		</Table.Thead>
	);
}

type RowNumberCellProps = {
	rowIndex: number,
	rowId: RowId,
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
	const { tid } = useDataTableContext();
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
			<RowNumberOverlayButton
				onMouseDown={(e) => props.onMouseDown(e, props.rowIndex)}
				{...tid.rowSelect(props.rowId)}
			>
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
	rowId: RowId,
	field: string,
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
	const linkClassName = clsx(contentClassName, sharedClasses.rowLink);

	return (
		<Table.Td
			style={getColumnStyle(props.width)}
			onMouseDown={e => props.onMouseDown(e, props.rowIndex)}
			className={clsx({
				[classes.selectedCell]: props.isSelected,
				'cursor-move': context.settings.allowRowMovement,
			})}
			{...context.tid.rowCell(props.rowId, props.field)}
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
	const rowId = rowTestIdOf(item, rowIndex);
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
			{...context.tid.row(rowId)}
		>
			<RowNumberCell
				rowIndex={rowIndex} rowId={rowId} rowNumber={rowNumber} isSelected={isRowSelected}
				onMouseDown={context.handlers.onRowMouseDown}
				onMouseEnter={context.handlers.onRowMouseEnter}
			/>
			{searchData.desired_fields.map(field => (
				<DataCell
					key={field}
					rowIndex={rowIndex}
					rowId={rowId}
					field={field}
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

function ListViewBody(): React.ReactNode {
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
