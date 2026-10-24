import {
	closestCenter, DndContext, DragOverlay, getClientRect, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Table as MantineTable, Text, Tooltip } from '@mantine/core';
import { IconGripVertical } from '@tabler/icons-react';
import clsx from 'clsx';
import React from 'react';
import { createPortal } from 'react-dom';

import { manualSortLockKeys, reorderRowIds } from './manualSortModel';
import { useTranslate } from '../../../i18n';
import { useCellDisplay } from '../cells/CellContent';
import { useExcelDataTableContext } from '../context';
import classes from '../ExcelDataTable.module.css';
import { useColumnCount } from '../tableLayout';

import type { RowId, SearchItem } from '../types';
import type { ClientRect, DragEndEvent, DragStartEvent, MeasuringConfiguration } from '@dnd-kit/core';


type SortableRow = ReturnType<typeof useSortable>;

/** Marks a drag handle, whose Space, Enter, arrows and Escape belong to the keyboard drag. */
export const SORT_HANDLE_ATTRIBUTE = 'data-sort-handle';

const SortableRowContext = React.createContext<SortableRow | null>(null);

/** Marks the placeholder row, which holds the dragged row's slot while the row itself is hidden. */
const SORT_PLACEHOLDER_ATTRIBUTE = 'data-sort-placeholder';

/**
 * Measures the dragged row by its slot. The row is hidden in the very commit that starts the drag,
 * which is also when dnd-kit takes the rect the overlay starts from: measured as is, a hidden row
 * is a 0x0 box at the viewport's origin, and the overlay ran off to the top-left by exactly the
 * row's offset. The placeholder rendered just before it holds the same slot at the same height.
 */
export function measureSortedRow(element: HTMLElement): ClientRect {
	const placeholder = element.hidden ? element.previousElementSibling : null;
	const slot = placeholder instanceof HTMLElement && placeholder.hasAttribute(SORT_PLACEHOLDER_ATTRIBUTE)
		? placeholder
		: element;
	// dnd-kit's own default for a draggable: the rect without the sortable shift it applies itself.
	return getClientRect(slot, { ignoreTransform: true });
}

const measuring: MeasuringConfiguration = { draggable: { measure: measureSortedRow } };

/** Activation needs a few pixels of travel, so a plain click on a handle never starts a drag. */
const pointerActivation = { activationConstraint: { distance: 4 } };

function findRowId(order: RowId[], id: string | number | undefined): RowId | undefined {
	return id === undefined ? undefined : order.find(rowId => String(rowId) === String(id));
}

/**
 * The drag-and-drop scope of the body, when manual sort is on: rows are sortable by their handle,
 * and a drop reports the new order through `onManualSort`. Wraps the body `<table>` rather than its
 * `<tbody>`, because dnd-kit renders its screen-reader announcements as `<div>`s beside its children.
 */
export function ManualSortArea({ children }: { children: React.ReactNode }): React.ReactNode {
	const { manualSort, selection } = useExcelDataTableContext();
	const sensors = useSensors(
		useSensor(PointerSensor, pointerActivation),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);
	const ids = React.useMemo(() => selection.order.map(String), [selection.order]);
	if (!manualSort.enabled) {
		return children;
	}
	const onDragStart = (event: DragStartEvent) => {
		const rowId = findRowId(selection.order, event.active.id);
		if (rowId === undefined) {
			return;
		}
		selection.clear();
		manualSort.start(rowId, draggedRowHeight(event));
	};
	const onDragEnd = (event: DragEndEvent) => {
		const activeId = findRowId(selection.order, event.active.id);
		const ordered = activeId === undefined
			? null
			: reorderRowIds(selection.order, activeId, findRowId(selection.order, event.over?.id));
		manualSort.end();
		if (ordered) {
			manualSort.onSort?.(ordered);
		}
	};
	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			measuring={measuring}
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
			onDragCancel={manualSort.end}
		>
			<SortableContext items={ids} strategy={verticalListSortingStrategy}>
				{children}
			</SortableContext>
			{createPortal(
				<DragOverlay>
					{manualSort.activeId === null ? null : <DraggedRowPreview rowId={manualSort.activeId} />}
				</DragOverlay>,
				document.body,
			)}
		</DndContext>
	);
}

/**
 * Follows the pointer: the dragged row's first value as its cell shows it (renderer, edge label),
 * not the raw id behind it, so the user sees which row moves.
 */
function DraggedRowPreview({ rowId }: { rowId: RowId }): React.ReactNode {
	const { selection, fields } = useExcelDataTableContext();
	const item = selection.itemsById.get(rowId);
	return (
		<div className={classes.sortDragOverlay}>
			<IconGripVertical size={16} aria-hidden />
			{item && fields[0] ? <PreviewValue item={item} field={fields[0]} /> : null}
		</div>
	);
}

function PreviewValue({ item, field }: { item: SearchItem, field: string }): React.ReactNode {
	const { content } = useCellDisplay(item, field);
	return <Text size='sm' truncate component='div'>{content}</Text>;
}

/**
 * The dragged row's height, read off the row itself: `onDragStart` runs before the commit that
 * hides it, and dnd-kit's own rect of the active node is only taken after that commit.
 */
function draggedRowHeight(event: DragStartEvent): number | null {
	const target = event.activatorEvent?.target;
	const row = target instanceof Element ? target.closest('tr') : null;
	const height = row?.getBoundingClientRect().height ?? 0;
	return height > 0 ? height : (event.active.rect.current.initial?.height ?? null);
}

/**
 * Makes its row sortable. While the row is dragged, an empty placeholder row takes its slot and
 * moves with the drop target; the row itself stays mounted but hidden, so a table-scope row keeps
 * the values its form holds.
 */
export function ManualSortRow({ rowId, children }: { rowId: RowId, children: React.ReactNode }): React.ReactNode {
	const { manualSort } = useExcelDataTableContext();
	const sortable = useSortable({ id: String(rowId), disabled: manualSort.lock !== null });
	return (
		<SortableRowContext.Provider value={sortable}>
			{sortable.isDragging ? <SortPlaceholderRow sortable={sortable} /> : null}
			{children}
		</SortableRowContext.Provider>
	);
}

function SortPlaceholderRow({ sortable }: { sortable: SortableRow }): React.ReactNode {
	const { manualSort, tid } = useExcelDataTableContext();
	const columnCount = useColumnCount();
	const style = { transform: CSS.Translate.toString(sortable.transform), transition: sortable.transition };
	return (
		<MantineTable.Tr
			ref={sortable.setNodeRef}
			style={style}
			{...{ [SORT_PLACEHOLDER_ATTRIBUTE]: '' }}
			{...tid.sortPlaceholder()}
		>
			<MantineTable.Td
				colSpan={columnCount}
				className={classes.sortPlaceholder}
				style={{ height: manualSort.placeholderHeight ?? undefined }}
			/>
		</MantineTable.Tr>
	);
}

export type SortableRowProps = {
	ref?: (element: HTMLElement | null) => void,
	style?: React.CSSProperties,
	hidden?: boolean,
};

/** Spread on a body row's `<tr>`: the sortable node and its shift, or nothing outside manual sort. */
export function useSortableRowProps(): SortableRowProps {
	const sortable = React.useContext(SortableRowContext);
	if (!sortable) {
		return {};
	}
	if (sortable.isDragging) {
		return { hidden: true };
	}
	return {
		ref: sortable.setNodeRef,
		style: { transform: CSS.Translate.toString(sortable.transform), transition: sortable.transition },
	};
}

/**
 * The grip after the index cell. A locked grip stays visible, dimmed, with the reason as its
 * tooltip. Its keys are not stopped here — the keyboard drag listens for them on the document —
 * the table's own key handler skips them instead ({@link SORT_HANDLE_ATTRIBUTE}).
 */
export function SortHandleCell({ rowId }: { rowId: RowId }): React.ReactNode {
	const { manualSort, tid } = useExcelDataTableContext();
	const sortable = React.useContext(SortableRowContext);
	const t = useTranslate('common');
	const lock = manualSort.lock;
	const label = lock
		? t(manualSortLockKeys[lock].key, { defaultValue: manualSortLockKeys[lock].defaultValue })
		: t('datatable.sortHandle', { defaultValue: 'Drag to reorder' });
	const active = sortable !== null && lock === null;
	return (
		<MantineTable.Td
			className={classes.sortHandleCell}
			onDoubleClick={event => event.stopPropagation()}
		>
			<Tooltip label={label} openDelay={300}>
				<span
					ref={active ? sortable.setActivatorNodeRef : undefined}
					className={clsx(classes.sortHandle)}
					data-disabled={active ? undefined : 'true'}
					aria-label={label}
					{...{ [SORT_HANDLE_ATTRIBUTE]: '' }}
					{...(active ? { ...sortable.attributes, ...sortable.listeners } : { role: 'img' })}
					{...tid.rowSortHandle(rowId)}
				>
					<IconGripVertical size={16} aria-hidden />
				</span>
			</Tooltip>
		</MantineTable.Td>
	);
}

/** The handle column's cell in a row that cannot be dragged at all: an open editor, the insert row. */
export function EmptySortHandleCell(): React.ReactNode {
	return <MantineTable.Td className={classes.sortHandleCell} aria-hidden />;
}
