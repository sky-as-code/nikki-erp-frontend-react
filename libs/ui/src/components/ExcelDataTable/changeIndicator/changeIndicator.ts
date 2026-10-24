import React from 'react';

import { rowIdOf } from '../types';

import type { RowId, SearchItem } from '../types';


export type RowChangeMark = 'new' | 'changed';

export type TrackedChanges = { created: ReadonlySet<string>, updated: ReadonlySet<string> };

/** "New" wins: a row created and then edited in the same session is still new. */
export function rowChangeMark(
	row: SearchItem,
	rowId: RowId,
	tracked: TrackedChanges,
	isNewRow?: (row: SearchItem) => boolean,
	isChangedRow?: (row: SearchItem) => boolean,
): RowChangeMark | null {
	const id = String(rowId);
	if (tracked.created.has(id) || isNewRow?.(row)) {
		return 'new';
	}
	if (tracked.updated.has(id) || isChangedRow?.(row)) {
		return 'changed';
	}
	return null;
}

/** The displayed ids missing from `baseline`: the rows a create added. */
export function idsAddedSince(baseline: ReadonlySet<string>, items: SearchItem[]): string[] {
	return items.map((item, index) => String(rowIdOf(item, index))).filter(id => !baseline.has(id));
}

export type ChangeIndicator = {
	enabled: boolean,
	markOf: (row: SearchItem, rowId: RowId) => RowChangeMark | null,
	/** Call before a create is written: the rows displayed now are not the new one. */
	beginCreate: () => void,
	/** The create failed: stop waiting for its row. */
	cancelCreate: () => void,
	noteUpdated: (rowId: RowId) => void,
	noteDeleted: (rowIds: RowId[]) => void,
};

type ChangeIndicatorInput = {
	enabled: boolean,
	items: SearchItem[],
	isLoading: boolean,
	isNewRow?: (row: SearchItem) => boolean,
	isChangedRow?: (row: SearchItem) => boolean,
};

/**
 * Tracks the rows this table wrote since it mounted. A create carries no id back from a page
 * callback, so the new row is found by difference: the first ids to appear that were not displayed
 * when the create began. The wait ends there, on a failure, or when a load finishes without one —
 * the row landed on another page — so a later page turn can never mark unrelated rows new.
 */
export function useChangeIndicator(input: ChangeIndicatorInput): ChangeIndicator {
	const { enabled, items, isLoading, isNewRow, isChangedRow } = input;
	const [tracked, setTracked] = React.useState<TrackedChanges>(() => ({ created: new Set(), updated: new Set() }));
	const latestItems = React.useRef(items);
	const awaiting = React.useRef<Set<string> | null>(null);
	const wasLoading = React.useRef(isLoading);
	React.useEffect(() => {
		latestItems.current = items;
		const baseline = awaiting.current;
		const loadEnded = wasLoading.current && !isLoading;
		wasLoading.current = isLoading;
		if (!baseline) {
			return;
		}
		const added = idsAddedSince(baseline, items);
		if (added.length > 0) {
			awaiting.current = null;
			setTracked(prev => ({ ...prev, created: new Set([...prev.created, ...added]) }));
		}
		else if (loadEnded) {
			awaiting.current = null;
		}
	}, [items, isLoading]);
	const writers = useChangeWriters(setTracked, latestItems, awaiting);
	const markOf = React.useCallback(
		(row: SearchItem, rowId: RowId) => (
			enabled ? rowChangeMark(row, rowId, tracked, isNewRow, isChangedRow) : null
		),
		[enabled, tracked, isNewRow, isChangedRow],
	);
	return React.useMemo(() => ({ enabled, markOf, ...writers }), [enabled, markOf, writers]);
}

type ChangeWriters = Pick<ChangeIndicator, 'beginCreate' | 'cancelCreate' | 'noteUpdated' | 'noteDeleted'>;

function useChangeWriters(
	setTracked: React.Dispatch<React.SetStateAction<TrackedChanges>>,
	latestItems: React.RefObject<SearchItem[]>,
	awaiting: React.RefObject<Set<string> | null>,
): ChangeWriters {
	return React.useMemo(() => ({
		beginCreate: () => {
			awaiting.current = new Set(latestItems.current.map((item, index) => String(rowIdOf(item, index))));
		},
		cancelCreate: () => {
			awaiting.current = null;
		},
		noteUpdated: (rowId: RowId) => setTracked(prev => (
			prev.updated.has(String(rowId)) ? prev : { ...prev, updated: new Set([...prev.updated, String(rowId)]) }
		)),
		noteDeleted: (rowIds: RowId[]) => setTracked((prev) => {
			const gone = new Set(rowIds.map(String));
			return {
				created: new Set([...prev.created].filter(id => !gone.has(id))),
				updated: new Set([...prev.updated].filter(id => !gone.has(id))),
			};
		}),
	}), [setTracked, latestItems, awaiting]);
}
