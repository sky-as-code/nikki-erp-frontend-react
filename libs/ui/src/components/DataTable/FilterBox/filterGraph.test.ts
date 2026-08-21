import { describe, expect, it } from 'vitest';

import {
	filterTreeToGraph, getGraphOrder, graphToFilterTree, mergeSearchGraphs, toSearchNode,
} from './filterGraph';
import { makeEmptyTree, newId } from './filterTree';

import type { FilterConditionNode, FilterGroupNode, FilterTree } from './filterTree';
import type * as dyn from '@nikkierp/common/dynamicModel';


const scope: dyn.SearchGraph = { if: ['product_template_id', '=', 'tpl-1'] };
const userOne: dyn.SearchGraph = { if: ['name', '*', 'widget'] };

function condOf(field: string, operator: dyn.SearchOperator, values: unknown[]): FilterConditionNode {
	return { kind: 'condition', id: newId(), field, operator, values };
}

function orOf(...children: FilterConditionNode[]): FilterGroupNode {
	return { kind: 'group', id: newId(), join: 'or', children };
}

function treeOf(...children: Array<FilterConditionNode | FilterGroupNode>): FilterTree {
	return { ...makeEmptyTree(), children };
}


describe('toSearchNode', () => {
	it('returns null for an absent graph', () => {
		expect(toSearchNode(undefined)).toBeNull();
	});

	it('returns null for a graph carrying only an order', () => {
		expect(toSearchNode({ order: [['name', 'asc']] })).toBeNull();
	});

	it('strips the order from a condition graph', () => {
		const node = toSearchNode({ ...userOne, order: [['name', 'asc']] });
		expect(node).toEqual({ if: ['name', '*', 'widget'] });
		expect(node).not.toHaveProperty('order');
	});

	it('ignores empty and/or lists', () => {
		expect(toSearchNode({ and: [] })).toBeNull();
		expect(toSearchNode({ or: [] })).toBeNull();
	});
});


describe('mergeSearchGraphs', () => {
	it('returns undefined when both are absent', () => {
		expect(mergeSearchGraphs(undefined, undefined)).toBeUndefined();
	});

	it('returns the user graph when there is no base', () => {
		expect(mergeSearchGraphs(undefined, userOne)).toBe(userOne);
	});

	it('returns the base when the user graph is absent', () => {
		expect(mergeSearchGraphs(scope, undefined)).toEqual({ if: ['product_template_id', '=', 'tpl-1'] });
	});

	// The regression this whole change exists for: a page-supplied graph used to replace the
	// user's, silently discarding every filter they had typed.
	it('ANDs the base with the user condition rather than replacing it', () => {
		expect(mergeSearchGraphs(scope, userOne)).toEqual({
			and: [
				{ if: ['product_template_id', '=', 'tpl-1'] },
				{ if: ['name', '*', 'widget'] },
			],
		});
	});

	it('nests a user `or` instead of splicing it, so the scope still narrows', () => {
		const userOr: dyn.SearchGraph = {
			or: [{ if: ['status', '=', 'draft'] }, { if: ['status', '=', 'active'] }],
		};
		expect(mergeSearchGraphs(scope, userOr)).toEqual({
			and: [
				{ if: ['product_template_id', '=', 'tpl-1'] },
				{ or: [{ if: ['status', '=', 'draft'] }, { if: ['status', '=', 'active'] }] },
			],
		});
	});

	it('nests a base `or` rather than splicing it', () => {
		const baseOr: dyn.SearchGraph = {
			or: [{ if: ['kind', '=', 'a'] }, { if: ['kind', '=', 'b'] }],
		};
		expect(mergeSearchGraphs(baseOr, userOne)).toEqual({
			and: [
				{ or: [{ if: ['kind', '=', 'a'] }, { if: ['kind', '=', 'b'] }] },
				{ if: ['name', '*', 'widget'] },
			],
		});
	});

	it('takes the order from the user and strips it off the base node', () => {
		const merged = mergeSearchGraphs(
			{ ...scope, order: [['created_at', 'desc']] },
			{ ...userOne, order: [['name', 'asc']] },
		);
		expect(merged?.order).toEqual([['name', 'asc']]);
		expect(merged?.and?.[0]).not.toHaveProperty('order');
		expect(merged?.and?.[1]).not.toHaveProperty('order');
	});

	it('falls back to the base order only when the user has none', () => {
		const merged = mergeSearchGraphs({ ...scope, order: [['created_at', 'desc']] }, userOne);
		expect(merged?.order).toEqual([['created_at', 'desc']]);
	});

	it('keeps a user order even when the user has no condition', () => {
		const merged = mergeSearchGraphs(scope, { order: [['name', 'asc']] });
		expect(merged).toEqual({ if: ['product_template_id', '=', 'tpl-1'], order: [['name', 'asc']] });
	});

	it('omits `order` entirely when neither side has one', () => {
		expect(mergeSearchGraphs(scope, userOne)).not.toHaveProperty('order');
	});
});


describe('getGraphOrder', () => {
	it('returns an empty order for an absent graph', () => {
		expect(getGraphOrder(undefined)).toEqual([]);
	});

	it('drops malformed entries', () => {
		const graph = { order: [['name', 'asc'], ['bad'], ['x', 'sideways']] } as unknown as dyn.SearchGraph;
		expect(getGraphOrder(graph)).toEqual([['name', 'asc']]);
	});
});

describe('filterTreeToGraph', () => {
	it('returns undefined for an empty tree with no order', () => {
		expect(filterTreeToGraph(makeEmptyTree(), [])).toBeUndefined();
	});

	it('emits a bare `if` for a single condition, not `and: [x]`', () => {
		const t = treeOf(condOf('name', '*', ['widget']));
		expect(filterTreeToGraph(t, [])).toEqual({ if: ['name', '*', 'widget'] });
	});

	it('emits `and` for two root conditions', () => {
		const t = treeOf(condOf('name', '*', ['w']), condOf('age', '>', [3]));
		expect(filterTreeToGraph(t, [])).toEqual({
			and: [{ if: ['name', '*', 'w'] }, { if: ['age', '>', 3] }],
		});
	});

	// The spec §4.4 output: A && (B || C || E) && D
	it('emits the §4.4 shape', () => {
		const t = treeOf(
			condOf('a', '=', ['1']),
			orOf(condOf('b', '=', ['2']), condOf('c', '=', ['3']), condOf('e', '=', ['4'])),
			condOf('d', '=', ['5']),
		);
		expect(filterTreeToGraph(t, [])).toEqual({
			and: [
				{ if: ['a', '=', '1'] },
				{ or: [{ if: ['b', '=', '2'] }, { if: ['c', '=', '3'] }, { if: ['e', '=', '4'] }] },
				{ if: ['d', '=', '5'] },
			],
		});
	});

	it('drops an incomplete row without breaking its siblings', () => {
		const t = treeOf(condOf('name', '*', ['w']), condOf('age', '>', []));
		expect(filterTreeToGraph(t, [])).toEqual({ if: ['name', '*', 'w'] });
	});

	it('emits exactly one of if/and/or', () => {
		const t = treeOf(condOf('a', '=', ['1']), orOf(condOf('b', '=', ['2']), condOf('c', '=', ['3'])));
		const graph = filterTreeToGraph(t, [])!;
		const keys = ['if', 'and', 'or'].filter(k => k in graph);
		expect(keys).toEqual(['and']);
	});

	it('carries a multi-value operator through as a rest tuple', () => {
		const t = treeOf(condOf('status', 'in', ['draft', 'active']));
		expect(filterTreeToGraph(t, [])).toEqual({ if: ['status', 'in', 'draft', 'active'] });
	});

	it('attaches the order, and emits an order-only graph when there are no conditions', () => {
		expect(filterTreeToGraph(makeEmptyTree(), [['name', 'asc']])).toEqual({ order: [['name', 'asc']] });
	});
});


describe('graphToFilterTree', () => {
	it('reads a bare condition', () => {
		const { tree, lossy } = graphToFilterTree({ if: ['name', '*', 'w'] });
		expect(lossy).toBe(false);
		expect(tree.children).toHaveLength(1);
		expect(tree.children[0]).toMatchObject({ kind: 'condition', field: 'name', operator: '*', values: ['w'] });
	});

	it('reads an `or` graph into a single OR group under the and-root', () => {
		const { tree } = graphToFilterTree({ or: [{ if: ['a', '=', '1'] }, { if: ['b', '=', '2'] }] });
		expect(tree.join).toBe('and');
		expect(tree.children).toHaveLength(1);
		expect(tree.children[0]).toMatchObject({ kind: 'group', join: 'or' });
	});

	it('keeps an operator the field would not normally offer', () => {
		const { tree } = graphToFilterTree({ if: ['edge', 'linked', 'x'] });
		expect(tree.children[0]).toMatchObject({ operator: 'linked' });
	});

	it('marks every condition locked when asked', () => {
		const { tree } = graphToFilterTree({ and: [{ if: ['a', '=', '1'] }, { if: ['b', '=', '2'] }] }, { locked: true });
		expect(tree.children.every(c => (c as { locked?: boolean }).locked === true)).toBe(true);
	});

	it('flags a structure deeper than the builder can draw', () => {
		const { lossy } = graphToFilterTree({
			or: [{ and: [{ if: ['a', '=', '1'] }, { if: ['b', '=', '2'] }] }, { if: ['c', '=', '3'] }],
		});
		expect(lossy).toBe(true);
	});

	it('reads an order-only graph as an empty tree', () => {
		const { tree, lossy } = graphToFilterTree({ order: [['name', 'asc']] });
		expect(tree.children).toEqual([]);
		expect(lossy).toBe(false);
	});
});


describe('round trip', () => {
	const cases: Array<[string, dyn.SearchGraph]> = [
		['single condition', { if: ['name', '*', 'w'] }],
		['two ANDed', { and: [{ if: ['a', '=', '1'] }, { if: ['b', '=', '2'] }] }],
		['spec §4.4', {
			and: [
				{ if: ['a', '=', '1'] },
				{ or: [{ if: ['b', '=', '2'] }, { if: ['c', '=', '3'] }, { if: ['e', '=', '4'] }] },
				{ if: ['d', '=', '5'] },
			],
		}],
		['or at the root', { or: [{ if: ['a', '=', '1'] }, { if: ['b', '=', '2'] }] }],
		['multi-value', { if: ['status', 'in', 'draft', 'active'] }],
	];

	it.each(cases)('survives %s unchanged', (_name, graph) => {
		const { tree } = graphToFilterTree(graph);
		expect(filterTreeToGraph(tree, [])).toEqual(graph);
	});
});
