import React from 'react';

import { emptySelection, moveSelection, pruneSelection, selectWithModifiers } from './selectionModel';
import { readStoredPageSize, allowedPageSizes, resolveInitialViewMode, writeStoredViewMode } from './storage';
import { rowIdOf } from './types';

import type { EditingApi, OpenState, SelectionApi } from './context';
import type { SelectionModifiers, SelectionState } from './selectionModel';
import type { ExcelViewMode, RowId, SearchData, SearchItem } from './types';
import type * as dyn from '@nikkierp/common/dynamicModel';


/**
 * The caller seeds a `size: 0` stub so the first round-trip resolves locally; this turns it into
 * the first real request. A zero falls through to the stored or default page size, otherwise no
 * search is ever sent.
 */
export function buildInitialSearchRequest(
	data: SearchData, initialRequest?: dyn.RestSearchRequest,
): dyn.RestSearchRequest {
	const storedSize = readStoredPageSize();
	const size = storedSize || initialRequest?.size || data.size || allowedPageSizes[0];
	return { ...(initialRequest ?? {}), page: data.page, size };
}

export function useSearchRequestState(
	data: SearchData,
	initialRequest: dyn.RestSearchRequest | undefined,
	onChange: ((request: dyn.RestSearchRequest) => void) | undefined,
) {
	const [searchRequest, setSearchRequest] = React.useState<dyn.RestSearchRequest>(
		() => buildInitialSearchRequest(data, initialRequest),
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

export function useViewModeState(initial: ExcelViewMode | undefined) {
	const [viewMode, setViewModeState] = React.useState<ExcelViewMode>(() => resolveInitialViewMode(initial));
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

export function useSelectionState(
	items: SearchItem[],
	onSelectionChange: ((selected: SearchItem[]) => void) | undefined,
	isEditing: boolean,
): SelectionApi {
	const { order, itemsById } = useRowOrder(items);
	const [state, setState] = React.useState<SelectionState>(emptySelection);

	React.useEffect(() => {
		setState(prev => pruneSelection(prev, order));
	}, [order]);

	React.useEffect(() => {
		onSelectionChange?.(state.ids.map(id => itemsById.get(id)).filter((item): item is SearchItem => !!item));
	}, [itemsById, onSelectionChange, state.ids]);

	// Every gesture is inert while a row is being edited: the requirement freezes selection there.
	const selectRow = React.useCallback((id: RowId, mods: SelectionModifiers = {}) => {
		if (!isEditing) {
			setState(prev => selectWithModifiers(prev, order, id, mods));
		}
	}, [isEditing, order]);
	const move = React.useCallback((delta: number) => {
		if (!isEditing) {
			setState(prev => moveSelection(prev, order, delta));
		}
	}, [isEditing, order]);
	const clear = React.useCallback(() => setState(emptySelection()), []);

	return React.useMemo(
		() => ({ ...state, selectRow, move, clear, order, itemsById }),
		[state, selectRow, move, clear, order, itemsById],
	);
}

/** Edit mode ends by itself when a load finishes, so a refreshed row never shows stale inputs. */
export function useEditingState(isLoading: boolean): EditingApi {
	const [rowId, setRowId] = React.useState<RowId | null>(null);
	const wasLoading = React.useRef(isLoading);
	React.useEffect(() => {
		if (wasLoading.current && !isLoading) {
			setRowId(null);
		}
		wasLoading.current = isLoading;
	}, [isLoading]);
	return React.useMemo(() => ({
		rowId,
		start: (id: RowId) => setRowId(id),
		stop: () => setRowId(null),
	}), [rowId]);
}
