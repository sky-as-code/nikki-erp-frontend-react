import {
	isCompleteCondition, isConditionNode, makeEmptyTree, newId, normalizeTree,
} from './filterTree';

import type { FilterConditionNode, FilterNode, FilterTree } from './filterTree';
import type * as dyn from '@nikkierp/common/dynamicModel';


/**
 * The `if` / `and` / `or` payload of a graph, with `order` dropped.
 *
 * A {@link dyn.SearchGraph} is a {@link dyn.SearchNode} plus a sort order, and only the root of
 * a request carries the order. Nesting a graph inside another one therefore has to shed it,
 * or the backend sees an `order` key where it expects a bare node.
 *
 * Returns null for a graph that says nothing — one holding only an order, or nothing at all.
 */
export function toSearchNode(graph: dyn.SearchGraph | undefined): dyn.SearchNode | null {
	if (!graph) {
		return null;
	}
	if (graph.if) {
		return { if: graph.if };
	}
	if (graph.and && graph.and.length > 0) {
		return { and: graph.and };
	}
	if (graph.or && graph.or.length > 0) {
		return { or: graph.or };
	}
	return null;
}

/**
 * ANDs a page-supplied base graph with the graph the user built.
 *
 * The base is a scoping condition the page author fixed — an embedded table's
 * `product_template_id = ${id}`, a report's `kiosk_ref = …`. It must narrow the user's query,
 * never replace it: replacing is what discarded every user filter and sort on any page carrying
 * a `filterGraph`.
 *
 * The base node is nested rather than spliced into the user's `and` list. Splicing would be
 * wrong whenever the user's graph is an `or` — `base && (A || B)` would become
 * `base || A || B`, silently widening a scoped table to the whole table.
 *
 * `order` is the user's alone. The base's is a default that only applies while the user has
 * expressed no preference, and by the time a user graph exists it has an order or means "none".
 */
export function mergeSearchGraphs(
	base: dyn.SearchGraph | undefined,
	user: dyn.SearchGraph | undefined,
): dyn.SearchGraph | undefined {
	const baseNode = toSearchNode(base);
	const userNode = toSearchNode(user);
	if (!baseNode) {
		return user;
	}
	if (!userNode) {
		// Nothing to AND with, but the user may still have set a sort order on an otherwise
		// empty graph, and that must survive.
		const order = user?.order ?? base?.order;
		return order && order.length > 0 ? { ...baseNode, order } : { ...baseNode };
	}
	const merged: dyn.SearchGraph = { and: [baseNode, userNode] };
	const order = user?.order ?? base?.order;
	if (order && order.length > 0) {
		merged.order = order;
	}
	return merged;
}

/** Reads the sort order off a graph, ignoring malformed entries. */
export function getGraphOrder(graph: dyn.SearchGraph | undefined): dyn.OrderBy {
	const rawOrder = graph?.order;
	if (!Array.isArray(rawOrder)) {
		return [];
	}
	return rawOrder.filter(
		(item): item is [string, dyn.SearchOrder] =>
			Array.isArray(item)
			&& item.length === 2
			&& typeof item[0] === 'string'
			&& (item[1] === 'asc' || item[1] === 'desc'),
	);
}

/**
 * Serializes the builder tree into the graph the backend accepts.
 *
 * Incomplete rows are dropped rather than sent: a half-typed condition is not a query, and the
 * panel has already refused to apply one the user actually meant (see `validateTree`). Dropping
 * happens per node, so an incomplete row never invalidates its siblings.
 *
 * Emits exactly one of `if` / `and` / `or`, which is what the backend's mutual-exclusion check
 * requires. A single surviving condition is expressed as a bare `if` rather than `and: [x]` —
 * the same query with less nesting, and the form the backend's own examples use.
 */
export function filterTreeToGraph(
	tree: FilterTree, orderBy: dyn.OrderBy,
): dyn.SearchGraph | undefined {
	const node = nodeToSearchNode(tree);
	const graph: dyn.SearchGraph = node ? { ...node } : {};
	if (orderBy.length > 0) {
		graph.order = orderBy;
	}
	return graph.if || graph.and || graph.or || graph.order ? graph : undefined;
}

function nodeToSearchNode(node: FilterNode): dyn.SearchNode | null {
	if (isConditionNode(node)) {
		return isCompleteCondition(node)
			? { if: [node.field, node.operator, ...node.values] as dyn.SearchCondition }
			: null;
	}
	const nodes = node.children
		.map(nodeToSearchNode)
		.filter((child): child is dyn.SearchNode => child !== null);
	if (nodes.length === 0) {
		return null;
	}
	if (nodes.length === 1) {
		return nodes[0];
	}
	return node.join === 'or' ? { or: nodes } : { and: nodes };
}

export type GraphToTreeResult = {
	tree: FilterTree,
	/**
	 * The graph nests deeper than the two levels the builder can draw.
	 *
	 * The tree still holds every condition it could place, but editing and re-applying it would
	 * not reproduce the original query, so the panel warns rather than silently rewriting it.
	 */
	lossy: boolean,
};

/**
 * Reads a graph back into an editable tree.
 *
 * Used to seed a list page's `filterGraph` as conditions the user can see and change. The
 * inverse of {@link filterTreeToGraph} up to node ids and to structures deeper than two levels.
 *
 * Operators outside the field's offered list are **kept**, not dropped: a graph written by hand
 * or by an older build is still a valid backend query, and silently discarding a condition would
 * widen the result set without telling anyone.
 */
export function graphToFilterTree(
	graph: dyn.SearchGraph | undefined, opts?: { locked?: boolean },
): GraphToTreeResult {
	const tree = makeEmptyTree();
	const node = toSearchNode(graph);
	if (!node) {
		return { tree, lossy: false };
	}
	const state = { lossy: false };
	const children = readNode(node, 0, state, opts?.locked === true);
	return { tree: normalizeTree({ ...tree, children }), lossy: state.lossy };
}

/**
 * Reads one wire node into builder nodes.
 *
 * `depth` counts how far inside the root `and` we are. Same-join nesting is lifted, which is
 * always safe — `and` and `or` are associative — so only a genuinely mixed structure below the
 * OR level trips the `lossy` flag.
 */
function readNode(
	node: dyn.SearchNode, depth: number, state: { lossy: boolean }, locked: boolean,
): FilterNode[] {
	if (node.if) {
		return [conditionFromWire(node.if, locked)];
	}
	const isOr = Array.isArray(node.or);
	const children = (isOr ? node.or : node.and) ?? [];
	if (children.length === 0) {
		return [];
	}
	if (!isOr) {
		// An `and` at any depth flattens into the level above it when that level is also an `and`;
		// nested inside an `or` it cannot be drawn, which the `or` branch below reports.
		return children.flatMap(child => readNode(child, depth, state, locked));
	}
	const branches = children.flatMap(child => {
		if (child.if) {
			return [conditionFromWire(child.if, locked)];
		}
		// An `or` whose branch is itself a group: beyond what the two-level builder can draw.
		state.lossy = true;
		return readNode(child, depth + 1, state, locked);
	});
	return [{ kind: 'group', id: newId(), join: 'or', children: branches }];
}

function conditionFromWire(condition: dyn.SearchCondition, locked: boolean): FilterConditionNode {
	const [field, operator, ...values] = condition;
	const node: FilterConditionNode = { kind: 'condition', id: newId(), field, operator, values };
	return locked ? { ...node, locked: true } : node;
}
