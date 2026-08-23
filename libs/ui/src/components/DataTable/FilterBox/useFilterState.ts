import React from 'react';

import { filterTreeToGraph, getGraphOrder, graphToFilterTree } from './filterGraph';
import { buildClauseFromInput } from './filterModel';
import {
	ensureNonEmpty, isCompleteCondition, isConditionNode, makeEmptyTree, removeRootCondition,
	upsertRootCondition,
} from './filterTree';

import type { FilterInputKind } from './filterModel';
import type { FilterConditionNode, FilterTree } from './filterTree';
import type * as dyn from '@nikkierp/common/dynamicModel';


export type UseFilterStateOptions = {
	/**
	 * A page-authored graph seeded into the tree as editable conditions, once on mount.
	 *
	 * List pages pass their `filterGraph` here so its conditions are visible and removable. An
	 * embedded table's record scoping is *not* passed here — that stays a locked base graph on
	 * the search hook, where the user cannot widen it away.
	 */
	initialFilterGraph?: dyn.SearchGraph,
	/** Seeds the sort pane when the initial request carries no order of its own. */
	fallbackOrderBy?: dyn.OrderBy,
	initialGraph?: dyn.SearchGraph,
};

export type FilterState = ReturnType<typeof useFilterState>;

/**
 * The filter state of the whole table: the condition tree, the sort order, what the user has
 * typed into each column cell, and whether archived rows are included.
 *
 * The tree is the single source of truth for conditions. The column filter row and the quick
 * search write into it through `upsertRootCondition` rather than keeping buckets of their own,
 * so every condition in effect is visible in the panel — which is what makes the "N filters
 * applied" badge and the condition list honest.
 *
 * Nothing here publishes a search on its own. Every field the panel owns — conditions, sort,
 * the archived toggle — is edited freely and reaches the server only when the user presses
 * Apply or hits Enter in a condition value box, so a half-built filter is never sent and the
 * result set never shifts under a user who is still composing.
 */
export function useFilterState(opts: UseFilterStateOptions = {}) {
	const [tree, setTree] = React.useState<FilterTree>(() => seedTree(opts.initialFilterGraph));
	const [lossy] = React.useState(() => graphToFilterTree(opts.initialFilterGraph).lossy);
	const [orderBy, setOrderBy] = React.useState<dyn.OrderBy>(
		() => seedOrderBy(opts.initialGraph, opts.fallbackOrderBy),
	);
	const [columnText, setColumnText] = React.useState<Record<string, string>>({});
	const [includeArchived, setIncludeArchived] = React.useState(false);

	const setColumnValue = React.useCallback((field: string, value: string) => {
		setColumnText(prev => ({ ...prev, [field]: value }));
	}, []);

	/**
	 * Commits a column cell into the tree as a root-level AND condition.
	 *
	 * Upserted on field+operator so a second Enter in the same cell replaces the condition
	 * rather than stacking a duplicate; an empty cell removes whatever it had contributed.
	 */
	const { commitColumnValue } = useDirectWriters(tree, setTree);

	const clearAll = React.useCallback(() => {
		setColumnText({});
		setTree(ensureNonEmpty(makeEmptyTree()));
		setOrderBy([]);
		setIncludeArchived(false);
	}, []);

	/** Replaces the whole order with one entry — what a column header click means. */
	const setSortSingle = React.useCallback((field: string, direction: dyn.SearchOrder) => {
		setOrderBy([[field, direction]]);
	}, []);

	// Drives the "N filters applied" chip. `includeArchived` is deliberately excluded: the
	// requirement keeps it out of the visible condition list, so counting it would report a
	// filter the user cannot see or remove from there.
	const activeCount = React.useMemo(() => countConditions(tree), [tree]);

	return {
		tree,
		setTree,
		lossy,
		orderBy,
		setOrderBy,
		setSortSingle,
		columnText,
		includeArchived,
		setIncludeArchived,
		setColumnValue,
		commitColumnValue,
		clearAll,
		activeCount,
	};
}

/**
 * Writes the current filter state into the search request — the only place that touches
 * `graph` or `include_archived`.
 *
 * Sort order is folded in here too rather than kept as a separate writer: both live on the same
 * `graph` object, so a second writer spreading the previous graph would drop whichever change
 * had not yet been committed to state.
 *
 * `include_archived` is a request flag, never a graph condition. A positive `is_archived`
 * condition would return *only* archived rows, which is a different query and a silently wrong
 * answer; the backend's `SearchQuery.IncludeArchived` is what widens the result set instead.
 * It is omitted entirely when false so the request stays equal-by-value to an unfiltered one
 * and `isSameSearchRequest` upstream does not see a spurious change.
 */
export function useApplyFilters(
	filters: FilterState,
	setSearchRequest: React.Dispatch<React.SetStateAction<dyn.RestSearchRequest>>,
): (overrides?: { tree?: FilterTree, orderBy?: dyn.OrderBy }) => void {
	const { tree, orderBy, includeArchived } = filters;
	return React.useCallback((overrides?: { tree?: FilterTree, orderBy?: dyn.OrderBy }) => {
		// Overrides exist because a click that both edits state and applies runs before the state
		// write lands; the caller passes the value it just computed rather than the stale one.
		const effectiveTree = overrides?.tree ?? tree;
		const effectiveOrderBy = overrides?.orderBy ?? orderBy;
		setSearchRequest(prev => {
			const next: dyn.RestSearchRequest = {
				...prev,
				// A changed filter invalidates the current page: page 5 of the old result set is
				// rarely page 5 of the new one, and is often past its end.
				page: 0,
				graph: filterTreeToGraph(effectiveTree, effectiveOrderBy),
			};
			if (includeArchived) {
				next.include_archived = true;
			}
			else {
				delete next.include_archived;
			}
			return next;
		});
	}, [tree, orderBy, includeArchived, setSearchRequest]);
}

/**
 * The column filter row's writer: it commits a condition and applies in the same tick.
 *
 * It returns the tree it produced rather than relying on the state write, which has not landed
 * by the time the caller applies — reading `tree` back there would publish the previous filter,
 * one edit behind.
 */
function useDirectWriters(
	tree: FilterTree, setTree: React.Dispatch<React.SetStateAction<FilterTree>>,
) {
	const treeRef = React.useRef(tree);
	treeRef.current = tree;

	const write = React.useCallback((next: FilterTree): FilterTree => {
		const settled = ensureNonEmpty(next);
		setTree(settled);
		return settled;
	}, [setTree]);

	const commitColumnValue = React.useCallback(
		(field: string, value: string, kind: FilterInputKind): FilterTree => {
			const clause = buildClauseFromInput(field, value, kind);
			// Cleared first, so retyping the cell with a different operator (`foo` then `>5`)
			// replaces the column's condition rather than leaving the previous one standing:
			// one cell means one condition, whatever operator the user typed into it.
			const cleared = clearFieldConditions(treeRef.current, field);
			return write(clause
				? upsertRootCondition(cleared, {
					field: clause.field, operator: clause.operator, values: clause.values,
				})
				: cleared);
		},
		[write],
	);

	return { commitColumnValue };
}

function seedTree(graph: dyn.SearchGraph | undefined): FilterTree {
	return ensureNonEmpty(graphToFilterTree(graph).tree);
}

function seedOrderBy(
	graph: dyn.SearchGraph | undefined, fallback: dyn.OrderBy | undefined,
): dyn.OrderBy {
	const fromGraph = getGraphOrder(graph);
	return fromGraph.length > 0 ? fromGraph : (fallback ?? []);
}

/** Drops every unlocked root condition on this field, whatever operator it carries. */
function clearFieldConditions(tree: FilterTree, field: string): FilterTree {
	const operators = tree.children
		.filter((child): child is FilterConditionNode =>
			isConditionNode(child) && !child.locked && child.field === field)
		.map(child => child.operator);
	return operators.reduce((acc, operator) => removeRootCondition(acc, field, operator), tree);
}

function countConditions(tree: FilterTree): number {
	let count = 0;
	const visit = (nodes: FilterTree['children']): void => {
		for (const node of nodes) {
			if (isConditionNode(node)) {
				if (isCompleteCondition(node)) {
					count += 1;
				}
			}
			else {
				visit(node.children);
			}
		}
	};
	visit(tree.children);
	return count;
}
