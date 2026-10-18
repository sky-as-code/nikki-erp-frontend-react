import React from 'react';

import {
	emptySelection, moveSelection, pruneSelection, seedSelection, selectAll, selectionStateOf, selectWithModifiers,
} from './selectionModel';
import { readStoredPageSize, allowedPageSizes, resolveInitialViewMode, writeStoredViewMode } from './storage';
import { rowIdOf } from './types';

import type { EditingApi, OpenState, SelectionApi } from './context';
import type { SelectionMode, SelectionModifiers, SelectionState } from './selectionModel';
import type { ExcelViewMode, RowId, SearchData, SearchItem } from './types';
import type * as dyn from '@nikkierp/common/dynamicModel';


/**
 * The caller seeds a `size: 0` stub so the first round-trip resolves locally; this turns it into
 * the first real request. A zero falls through to the stored or default page size, otherwise no
 * search is ever sent.
 */
export function buildInitialSearchRequest(
	data: SearchData, initialRequest?: dyn.RestSearchRequest, pageSize?: number,
): dyn.RestSearchRequest {
	const size = pageSize || readStoredPageSize() || initialRequest?.size || data.size || allowedPageSizes[0];
	return { ...(initialRequest ?? {}), page: data.page, size };
}

export function useSearchRequestState(
	data: SearchData,
	initialRequest: dyn.RestSearchRequest | undefined,
	onChange: ((request: dyn.RestSearchRequest) => void) | undefined,
	pageSize?: number,
) {
	const [searchRequest, setSearchRequest] = React.useState<dyn.RestSearchRequest>(
		() => buildInitialSearchRequest(data, initialRequest, pageSize),
	);

	// The server may clamp the page (e.g. past the end after a delete); follow it, but only when
	// the size still matches, otherwise this is a stale response for a request already replaced.
	React.useEffect(() => {
		setSearchRequest(prev => (
			prev.size !== data.size || prev.page === data.page ? prev : { ...prev, page: data.page }
		));
	}, [data.page, data.size]);

	React.useEffect(() => {
		onChange?.(searchRequest);
	}, [onChange, searchRequest]);

	return { searchRequest, setSearchRequest };
}

export function useOpenState(initial = false): OpenState {
	const [isOpen, setIsOpen] = React.useState(initial);
	return React.useMemo(() => ({
		isOpen,
		open: () => setIsOpen(true),
		close: () => setIsOpen(false),
		toggle: () => setIsOpen(prev => !prev),
	}), [isOpen]);
}

/**
 * `allowed` is what keeps a remembered mode from outliving the page that offered it: the stored
 * value is per path, but a path's modes change between builds, and a mode nothing renders any
 * more would leave the table blank with no way back.
 */
export function useViewModeState(initial: ExcelViewMode | undefined, allowed?: ExcelViewMode[]) {
	const [viewMode, setViewModeState] = React.useState<ExcelViewMode>(() => resolveInitialViewMode(initial, allowed));
	const setViewMode = React.useCallback((mode: ExcelViewMode) => {
		writeStoredViewMode(mode);
		setViewModeState(mode);
	}, []);
	return { viewMode, setViewMode };
}

export function useRowOrder(items: SearchItem[]) {
	return React.useMemo(() => {
		const order: RowId[] = [];
		const itemsById = new Map<RowId, SearchItem>();
		items.forEach((item, index) => {
			const id = rowIdOf(item, index);
			order.push(id);
			itemsById.set(id, item);
		});
		return { order, itemsById };
	}, [items]);
}

export type SelectionOptions = {
	mode?: SelectionMode,
	initialSelectedIds?: RowId[],
};

/**
 * `isFrozen` holds every gesture while the insert row is open. A row being updated does not freeze
 * it: picking another row, select-all or Deselect leave that row, which discards its edit.
 */
export function useSelectionState(
	items: SearchItem[],
	onSelectionChange: ((selected: SearchItem[]) => void) | undefined,
	isFrozen: boolean,
	options: SelectionOptions = {},
): SelectionApi {
	const { mode = 'multiple', initialSelectedIds } = options;
	const { order, itemsById } = useRowOrder(items);
	const [state, setState] = React.useState<SelectionState>(emptySelection);
	// Held until the first rows arrive: pruning against the empty pre-load order would drop it.
	const pendingSeed = React.useRef(initialSelectedIds?.length ? seedSelection(initialSelectedIds, mode) : null);

	React.useEffect(() => {
		const seed = pendingSeed.current;
		if (seed && order.length > 0) {
			pendingSeed.current = null;
			setState(pruneSelection(seed, order));
			return;
		}
		setState(prev => pruneSelection(prev, order));
	}, [order]);

	React.useEffect(() => {
		onSelectionChange?.(state.ids.map(id => itemsById.get(id)).filter((item): item is SearchItem => !!item));
	}, [itemsById, onSelectionChange, state.ids]);

	const selectRow = React.useCallback((id: RowId, mods: SelectionModifiers = {}) => {
		if (!isFrozen) {
			setState(prev => selectWithModifiers(prev, order, id, mods, mode));
		}
	}, [isFrozen, order, mode]);
	const move = React.useCallback((delta: number) => {
		if (!isFrozen) {
			setState(prev => moveSelection(prev, order, delta));
		}
	}, [isFrozen, order]);
	const clear = React.useCallback(() => setState(emptySelection()), []);
	const toggleAll = useToggleAll(setState, order, isFrozen || mode === 'single');

	return React.useMemo(
		() => ({ ...state, selectRow, move, clear, toggleAll, isEnabled: !isFrozen, mode, order, itemsById }),
		[state, selectRow, move, clear, toggleAll, isFrozen, mode, order, itemsById],
	);
}

function useToggleAll(
	setState: React.Dispatch<React.SetStateAction<SelectionState>>, order: RowId[], isInert: boolean,
): () => void {
	return React.useCallback(() => {
		if (!isInert) {
			setState(prev => (selectionStateOf(prev, order) === 'all' ? emptySelection() : selectAll(order)));
		}
	}, [setState, order, isInert]);
}

/**
 * Edit mode ends by itself when a load finishes, so a refreshed row never shows stale inputs. The
 * insert row does not: its values belong to no loaded row, and an unrelated refresh must not lose
 * what the user typed. The two are exclusive, one form at a time.
 */
export function useEditingState(isLoading: boolean): EditingApi {
	const [rowId, setRowId] = React.useState<RowId | null>(null);
	const [creating, setCreating] = React.useState(false);
	const wasLoading = React.useRef(isLoading);
	React.useEffect(() => {
		if (wasLoading.current && !isLoading) {
			setRowId(null);
		}
		wasLoading.current = isLoading;
	}, [isLoading]);
	return React.useMemo(() => ({
		rowId,
		start: (id: RowId) => {
			setCreating(false);
			setRowId(id);
		},
		stop: () => setRowId(null),
		creating,
		startCreate: () => {
			setRowId(null);
			setCreating(true);
		},
		stopCreate: () => setCreating(false),
		isActive: rowId !== null || creating,
	}), [rowId, creating]);
}

export function isEditedRowDeselected(rowId: RowId | null, selectedIds: RowId[]): boolean {
	return rowId !== null && !selectedIds.includes(rowId);
}

/**
 * A selection change that leaves the edited row — another row picked, select-all, Deselect —
 * discards the edit. Only a change of the selection counts: starting an edit selects its row in
 * the same update, and a start alone must not be undone here.
 */
export function useDiscardEditOnSelectionChange(editing: EditingApi, selectedIds: RowId[]): void {
	const previousIds = React.useRef(selectedIds);
	React.useEffect(() => {
		if (previousIds.current === selectedIds) {
			return;
		}
		previousIds.current = selectedIds;
		if (isEditedRowDeselected(editing.rowId, selectedIds)) {
			editing.stop();
		}
	}, [editing, selectedIds]);
}
