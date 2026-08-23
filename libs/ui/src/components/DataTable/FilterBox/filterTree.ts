import { getDefaultOperator, isMultiValueOperator, isNoValueOperator } from './filterModel';

import type { FilterInputKind } from './filterModel';
import type * as dyn from '@nikkierp/common/dynamicModel';


/**
 * One condition, as the UI edits it.
 *
 * Deliberately not a {@link dyn.SearchCondition}: that is a positional tuple built for the wire,
 * while this carries the `id` a React list needs and keeps `values` separate so an operator
 * change does not have to re-parse the tuple.
 */
export type FilterConditionNode = {
	kind: 'condition',
	/** Stable across edits, so a row's identity does not depend on its position. */
	id: string,
	field: string,
	operator: dyn.SearchOperator,
	/** Empty for `is_set` / `not_set`; more than one for `in` / `not_in`. */
	values: unknown[],
	/** Seeded from a page's scoping graph: rendered read-only, never removable. */
	locked?: boolean,
};

export type FilterGroupNode = {
	kind: 'group',
	id: string,
	join: 'and' | 'or',
	children: FilterNode[],
};

export type FilterNode = FilterConditionNode | FilterGroupNode;

/**
 * The whole expression.
 *
 * The root is always an `and` group. That invariant is what makes insertion uniform: every
 * top-level row is a child of the same node, so "add an AND" is always an append into
 * `root.children` and never has to special-case a bare single condition.
 */
export type FilterTree = FilterGroupNode & { join: 'and' };

let idCounter = 0;

/**
 * A process-unique node id.
 *
 * A counter rather than a random or time-based value: this module is imported by pure tests that
 * assert on structure, and a deterministic sequence keeps failures readable. Ids are never
 * persisted — {@link filterTreeToGraph} drops them — so uniqueness only has to hold within one
 * page's lifetime.
 */
export function newId(): string {
	idCounter += 1;
	return `fc${idCounter}`;
}

export function makeBlankCondition(): FilterConditionNode {
	return { kind: 'condition', id: newId(), field: '', operator: '=', values: [] };
}

export function makeEmptyTree(): FilterTree {
	return { kind: 'group', id: newId(), join: 'and', children: [] };
}

export function isConditionNode(node: FilterNode): node is FilterConditionNode {
	return node.kind === 'condition';
}

export function isGroupNode(node: FilterNode): node is FilterGroupNode {
	return node.kind === 'group';
}

/**
 * The chain of nodes from the root down to `id`, inclusive, or null when absent.
 *
 * Insertion needs the parent as well as the target — an OR on a row already inside an OR group
 * appends to that group, while an OR on a root-level row wraps it — so a plain find is not
 * enough.
 */
export function findPath(tree: FilterTree, id: string): FilterNode[] | null {
	const walk = (node: FilterNode, trail: FilterNode[]): FilterNode[] | null => {
		const here = [...trail, node];
		if (node.id === id) {
			return here;
		}
		if (!isGroupNode(node)) {
			return null;
		}
		for (const child of node.children) {
			const found = walk(child, here);
			if (found) {
				return found;
			}
		}
		return null;
	};
	return walk(tree, []);
}

/**
 * Restores the tree's invariants after any structural edit.
 *
 * Bottom-up and single-pass. Drops empty groups, collapses single-child groups, flattens
 * same-join nesting, and forces the root back to `and`. Every degenerate structure the spec
 * warns about — a dangling `AND`, an empty `OR` group — is impossible on the far side of this.
 *
 * A collapsed group yields the surviving child **with its own id**, not the group's. Reusing the
 * group's id would give React a node whose key matches but whose subtree differs, remounting the
 * row and dropping focus out of whatever input the user was typing in.
 */
export function normalizeTree(tree: FilterTree): FilterTree {
	// `join` is written rather than spread through: the root's `and` is an invariant, and a tree
	// arriving with a different join (a hand-built one, or a deserialized `{or: [...]}`) must come
	// out conforming rather than propagating the violation.
	const root = { ...tree, join: 'and' as const };
	const normalized = normalizeNode(tree);
	if (!normalized) {
		return { ...root, children: [] };
	}
	if (isGroupNode(normalized) && normalized.join === 'and') {
		return { ...root, children: normalized.children };
	}
	// A lone condition, or an `or` group that swallowed the root: the root itself must stay an
	// `and`, so the survivor becomes its only child.
	return { ...root, children: [normalized] };
}

function normalizeNode(node: FilterNode): FilterNode | null {
	if (isConditionNode(node)) {
		return node;
	}
	const children = node.children
		.map(normalizeNode)
		.filter((child): child is FilterNode => child !== null)
		.flatMap(child => isGroupNode(child) && child.join === node.join ? child.children : [child]);
	if (children.length === 0) {
		return null;
	}
	if (children.length === 1) {
		return children[0];
	}
	return { ...node, children };
}

/**
 * Guarantees the builder always shows at least one row (§31 empty state).
 *
 * Kept out of {@link normalizeTree} so normalization stays a pure structural function that can
 * be tested against the genuinely-empty case; only the UI wants a blank row conjured up.
 */
export function ensureNonEmpty(tree: FilterTree): FilterTree {
	return tree.children.length > 0 ? tree : { ...tree, children: [makeBlankCondition()] };
}

/**
 * Adds a condition ANDed with the rest of the expression.
 *
 * The new row is always a **root-level** sibling, wherever the clicked row sits: AND is the
 * root's join, so an AND raised from inside an OR branch means "and this whole group with a new
 * condition", not "and it with that one branch". It lands immediately after the clicked row's
 * root-level ancestor, matching the spec's diagrams, which append below rather than prepend.
 */
export function addAnd(tree: FilterTree, targetId?: string): FilterTree {
	const fresh = makeBlankCondition();
	const index = targetId ? rootIndexOf(tree, targetId) : -1;
	const children = [...tree.children];
	if (index < 0) {
		children.push(fresh);
	}
	else {
		children.splice(index + 1, 0, fresh);
	}
	return normalizeTree({ ...tree, children });
}

/**
 * Adds a condition ORed with the clicked one.
 *
 * Two cases, and the first is the one the spec's §4.4 example pins down:
 *
 * - the row is already inside an OR group — the new branch is **appended at the end of that
 *   group**, not inserted after the clicked row. Given `A && (B || C) && D`, an OR raised on
 *   `B` yields `A && (B || C || E) && D`, which is the output the spec states.
 * - the row is a plain root-level condition — it and the new branch become a fresh OR group,
 *   which the root then ANDs with everything else.
 */
export function addOr(tree: FilterTree, targetId: string): FilterTree {
	const path = findPath(tree, targetId);
	if (!path || path.length < 2) {
		return addAnd(tree, targetId);
	}
	const parent = path[path.length - 2];
	const target = path[path.length - 1];
	const fresh = makeBlankCondition();

	if (isGroupNode(parent) && parent.join === 'or') {
		return normalizeTree(replaceNode(tree, parent.id, {
			...parent,
			children: [...parent.children, fresh],
		}));
	}
	const wrapped: FilterGroupNode = {
		kind: 'group', id: newId(), join: 'or', children: [target, fresh],
	};
	return normalizeTree(replaceNode(tree, target.id, wrapped));
}

/** Removes a node and restores the invariants; every §12 degenerate case falls out of that. */
export function removeNode(tree: FilterTree, id: string): FilterTree {
	const prune = (node: FilterGroupNode): FilterGroupNode => ({
		...node,
		children: node.children
			.filter(child => child.id !== id)
			.map(child => isGroupNode(child) ? prune(child) : child),
	});
	return normalizeTree(prune(tree) as FilterTree);
}

/** Applies a patch to one condition, sharing every untouched subtree. */
export function updateCondition(
	tree: FilterTree, id: string, patch: Partial<Omit<FilterConditionNode, 'kind' | 'id'>>,
): FilterTree {
	const visit = (node: FilterNode): FilterNode => {
		if (node.id === id && isConditionNode(node)) {
			return { ...node, ...patch };
		}
		if (!isGroupNode(node)) {
			return node;
		}
		const children = node.children.map(visit);
		return children.some((child, i) => child !== node.children[i])
			? { ...node, children }
			: node;
	};
	return visit(tree) as FilterTree;
}

/**
 * The patch a field change implies (§17, rule 5).
 *
 * The operator list is derived from the field's kind, so the previous operator may not even be
 * offered any more; resetting to the kind's default is the only choice guaranteed to be valid.
 * The value goes with it — a value typed for `name` is meaningless under `created_at`.
 */
export function applyFieldChange(
	field: string, kind: FilterInputKind,
): Partial<FilterConditionNode> {
	return { field, operator: getDefaultOperator(kind), values: [] };
}

/**
 * The patch an operator change implies (§18, rule 6).
 *
 * Clears the value when the new operator takes none, and **also** when the change crosses the
 * single/multi-value boundary: a lone value stranded in a `MultiSelect`, or a list handed to a
 * single-value input, renders as either an empty control or a silently truncated query.
 */
export function applyOperatorChange(
	node: FilterConditionNode, operator: dyn.SearchOperator,
): Partial<FilterConditionNode> {
	if (isNoValueOperator(operator)) {
		return { operator, values: [] };
	}
	const wasMulti = isMultiValueOperator(node.operator);
	const isMulti = isMultiValueOperator(operator);
	return wasMulti === isMulti ? { operator } : { operator, values: [] };
}

/**
 * Replaces the root-level condition on the same field+operator, or appends one.
 *
 * The column filter row and the quick search both write through here. Matching on field *and*
 * operator is what stops a second Enter in the same column producing `name * foo && name * foo`,
 * while still allowing `age > 5 && age < 10`, which is a pair a user legitimately wants.
 */
export function upsertRootCondition(
	tree: FilterTree, condition: Omit<FilterConditionNode, 'kind' | 'id'>,
): FilterTree {
	const index = tree.children.findIndex(
		child => isConditionNode(child)
			&& !child.locked
			&& child.field === condition.field
			&& child.operator === condition.operator,
	);
	if (index >= 0) {
		const existing = tree.children[index] as FilterConditionNode;
		const children = [...tree.children];
		children[index] = { ...existing, ...condition };
		return { ...tree, children };
	}
	const fresh: FilterConditionNode = { kind: 'condition', id: newId(), ...condition };
	// Blank rows are the empty-state placeholder, not user intent; the incoming condition takes
	// the first one over rather than appearing beneath a stray empty row.
	const blankIndex = tree.children.findIndex(child => isConditionNode(child) && isBlank(child));
	if (blankIndex >= 0) {
		const children = [...tree.children];
		children[blankIndex] = fresh;
		return { ...tree, children };
	}
	return { ...tree, children: [...tree.children, fresh] };
}

/** Removes the root-level condition on this field+operator, if any. */
export function removeRootCondition(
	tree: FilterTree, field: string, operator: dyn.SearchOperator,
): FilterTree {
	const match = tree.children.find(
		child => isConditionNode(child)
			&& !child.locked
			&& child.field === field
			&& child.operator === operator,
	);
	return match ? removeNode(tree, match.id) : tree;
}

/** Whether a condition carries enough to send. */
export function isCompleteCondition(node: FilterConditionNode): boolean {
	if (!node.field) {
		return false;
	}
	if (isNoValueOperator(node.operator)) {
		return true;
	}
	return node.values.length > 0 && node.values.every(value => value !== '' && value != null);
}

/** An untouched placeholder row: no field chosen and nothing typed. */
export function isBlank(node: FilterConditionNode): boolean {
	return !node.field && node.values.length === 0;
}

export type FilterValidationIssue = {
	nodeId: string,
	reason: 'noField' | 'noValue',
};

/**
 * The rows that block an Apply (§29).
 *
 * A wholly untouched row is **exempt**: it is the §31 empty state, and flagging it would mean a
 * freshly opened panel could never be applied. A row with a field but no value is a real error —
 * the spec is explicit that partial conditions must not be silently dropped.
 */
export function validateTree(tree: FilterTree): FilterValidationIssue[] {
	const issues: FilterValidationIssue[] = [];
	const visit = (node: FilterNode): void => {
		if (isGroupNode(node)) {
			node.children.forEach(visit);
			return;
		}
		if (node.locked || isBlank(node)) {
			return;
		}
		if (!node.field) {
			issues.push({ nodeId: node.id, reason: 'noField' });
			return;
		}
		if (!isCompleteCondition(node)) {
			issues.push({ nodeId: node.id, reason: 'noValue' });
		}
	};
	tree.children.forEach(visit);
	return issues;
}

/** One rendered line of the builder, in top-to-bottom order. */
export type FilterRenderRow = {
	node: FilterConditionNode,
	/** 0 for a root-level condition, 1 for a branch inside an OR group. */
	depth: 0 | 1,
	/** The row that owns the group's `[AND] [OR]` cluster. */
	isFirstInGroup: boolean,
	/** Whether this row shows `[AND] [OR]` at all; later OR branches show only `[×]`. */
	showJoinButtons: boolean,
	/** Renders the leading `or` label and the indent. */
	isOrBranch: boolean,
	/**
	 * Renders the leading `and` label: every root-level entry after the first one, since it is
	 * joined to the entry above it by the root's `and`. The very first row has nothing above it
	 * to be joined to, so it carries no marker.
	 */
	isAndBranch: boolean,
	locked: boolean,
};

/**
 * Flattens the tree into the rows the panel draws.
 *
 * The `[AND] [OR]` cluster belongs to root-level rows and to the *first* row of an OR group;
 * later branches carry `[×]` only. That is exactly the spec's own ASCII diagram, and it falls
 * out of the tree rather than needing state of its own.
 */
export function flattenForRender(tree: FilterTree): FilterRenderRow[] {
	const rows: FilterRenderRow[] = [];
	for (const [rootIndex, child] of tree.children.entries()) {
		// Keyed off the root position, not the flat row position: the first branch of an OR group
		// opens a new root-level entry and so is joined by `and` to whatever precedes it, while
		// the later branches of that same group are joined by `or` instead.
		const isAndBranch = rootIndex > 0;
		if (isConditionNode(child)) {
			rows.push({
				node: child,
				depth: 0,
				isFirstInGroup: true,
				showJoinButtons: true,
				isOrBranch: false,
				isAndBranch,
				locked: child.locked === true,
			});
			continue;
		}
		child.children.forEach((branch, index) => {
			if (!isConditionNode(branch)) {
				// Deeper nesting than the 2-level UI produces. `graphToFilterTree` flags such a
				// graph as lossy, and the panel shows a notice instead of pretending to edit it.
				return;
			}
			rows.push({
				node: branch,
				depth: index === 0 ? 0 : 1,
				isFirstInGroup: index === 0,
				showJoinButtons: index === 0,
				isOrBranch: index > 0,
				isAndBranch: isAndBranch && index === 0,
				locked: branch.locked === true,
			});
		});
	}
	return rows;
}

function rootIndexOf(tree: FilterTree, id: string): number {
	return tree.children.findIndex(
		child => child.id === id || (isGroupNode(child) && child.children.some(c => c.id === id)),
	);
}

function replaceNode(tree: FilterTree, id: string, replacement: FilterNode): FilterTree {
	const visit = (node: FilterNode): FilterNode => {
		if (node.id === id) {
			return replacement;
		}
		return isGroupNode(node) ? { ...node, children: node.children.map(visit) } : node;
	};
	return visit(tree) as FilterTree;
}
