import { fetchResourceHistory } from '@nikkierp/common/service';
import React from 'react';

import type { ResourceHistoryItem, ResourceHistoryResponse } from '@nikkierp/common/service';
import type { ClientErrorItem } from '@nikkierp/common/types';


export const HISTORY_PAGE_SIZE = 20;

export type ResourceHistoryPages = {
	items: ResourceHistoryItem[],
	total: number,
	/** Pages loaded so far; the next one to ask for. */
	loadedPages: number,
	isLoading: boolean,
	/** Thrown by the request: a 5xx, a network failure or an unparseable body. */
	error: unknown | null,
	/** A 4xx answer, e.g. the caller may no longer read the record. */
	clientErrors: ClientErrorItem[],
};

export type ResourceHistoryState = ResourceHistoryPages & {
	hasMore: boolean,
	loadMore: () => void,
	reload: () => void,
};

export const EMPTY_HISTORY: ResourceHistoryPages = {
	items: [], total: 0, loadedPages: 0, isLoading: false, error: null, clientErrors: [],
};

/**
 * Folds one fetched page into what is shown. Page 0 replaces the list; a later page appends, skipping
 * entries already shown: actions logged after the first page shift the offsets by as many rows.
 */
export function mergeHistoryPage(
	prev: ResourceHistoryPages, page: number, response: ResourceHistoryResponse | null, clientErrors: ClientErrorItem[],
): ResourceHistoryPages {
	if (!response) {
		return { ...prev, isLoading: false, error: null, clientErrors };
	}
	const base = page === 0 ? [] : prev.items;
	const seen = new Set(base.map(item => item.id));
	const items = [...base, ...(response.items ?? []).filter(item => !seen.has(item.id))];
	const total = response.total ?? items.length;
	return { items, total, loadedPages: page + 1, isLoading: false, error: null, clientErrors };
}

export type UseResourceHistoryOptions = {
	/** Nothing is fetched while false, e.g. while the Audit panel is closed. */
	enabled: boolean,
	/** A new value reloads the first page: the record object, replaced on every refetch after a save or action. */
	refreshKey?: unknown,
	pageSize?: number,
};

/**
 * A record's audit history, newest first, a page at a time. Switching to another record clears the
 * list; a reload of the same record keeps the shown entries until the fresh page replaces them.
 */
export function useResourceHistory(
	resourceCode: string | null, resourceId: string | null, options: UseResourceHistoryOptions,
): ResourceHistoryState {
	const { enabled, refreshKey, pageSize = HISTORY_PAGE_SIZE } = options;
	const [state, setState] = React.useState<ResourceHistoryPages>(EMPTY_HISTORY);
	const sequenceRef = React.useRef(0);
	const fetchPage = useHistoryPageFetcher(resourceCode, resourceId, pageSize, setState, sequenceRef);

	React.useEffect(() => {
		sequenceRef.current += 1;
		setState(EMPTY_HISTORY);
	}, [resourceCode, resourceId]);

	React.useEffect(() => {
		if (enabled) {
			fetchPage(0);
		}
	}, [enabled, fetchPage, refreshKey]);

	const hasMore = state.items.length < state.total && state.loadedPages > 0;
	const nextPage = state.loadedPages;
	const loadMore = React.useCallback(() => {
		if (hasMore && !state.isLoading) {
			fetchPage(nextPage);
		}
	}, [fetchPage, hasMore, nextPage, state.isLoading]);
	const reload = React.useCallback(() => fetchPage(0), [fetchPage]);
	return { ...state, hasMore, loadMore, reload };
}

/** A fetch whose answer is dropped once a newer first-page load or a record switch superseded it. */
function useHistoryPageFetcher(
	resourceCode: string | null,
	resourceId: string | null,
	pageSize: number,
	setState: React.Dispatch<React.SetStateAction<ResourceHistoryPages>>,
	sequenceRef: React.RefObject<number>,
): (page: number) => void {
	return React.useCallback((page: number) => {
		if (!resourceCode || !resourceId) {
			return;
		}
		if (page === 0) {
			sequenceRef.current += 1;
		}
		const sequence = sequenceRef.current;
		setState(prev => ({ ...prev, isLoading: true }));
		fetchResourceHistory({ resourceCode, resourceId, page, size: pageSize })
			.then(result => {
				if (sequence === sequenceRef.current) {
					setState(prev => mergeHistoryPage(prev, page, result.data, result.clientErrors));
				}
			})
			.catch((error: unknown) => {
				if (sequence === sequenceRef.current) {
					setState(prev => ({ ...prev, isLoading: false, error }));
				}
			});
	}, [resourceCode, resourceId, pageSize, setState, sequenceRef]);
}
