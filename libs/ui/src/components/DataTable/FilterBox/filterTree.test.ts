import { describe, expect, it } from 'vitest';

import {
	addAnd, addOr, applyFieldChange, applyOperatorChange, ensureNonEmpty, findPath,
	flattenForRender, isCompleteCondition, makeBlankCondition, normalizeTree, removeNode,
	removeRootCondition, updateCondition, upsertRootCondition, validateTree,
} from './filterTree';

import type { FilterConditionNode, FilterGroupNode, FilterTree } from './filterTree';
import type * as dyn from '@nikkierp/common/dynamicModel';


function cond(id: string, field: string, operator: dyn.SearchOperator = '=', values: unknown[] = ['v']): FilterConditionNode {
	return { kind: 'condition', id, field, operator, values };
}

function group(id: string, join: 'and' | 'or', children: FilterConditionNode[] | FilterGroupNode[]): FilterGroupNode {
	return { kind: 'group', id, join, children };
}

function tree(...children: Array<FilterConditionNode | FilterGroupNode>): FilterTree {
	return { kind: 'group', id: 'root', join: 'and', children };
}

/** The row order the panel draws, as `field` names — the shape the assertions care about. */
function fieldsOf(t: FilterTree): string[] {
	return flattenForRender(t).map(row => row.node.field);
}


describe('normalizeTree', () => {
	it('drops an empty group', () => {
		const result = normalizeTree(tree(cond('a', 'A'), group('g', 'or', [])));
		expect(result.children).toHaveLength(1);
		expect(result.children[0].id).toBe('a');
	});

	it('collapses a single-child group, keeping the CHILD id', () => {
		// The group's id would remount the row and drop focus mid-edit.
		const result = normalizeTree(tree(group('g', 'or', [cond('b', 'B')])));
		expect(result.children).toHaveLength(1);
		expect(result.children[0].id).toBe('b');
	});

	it('flattens an and-group nested directly in the root', () => {
		const result = normalizeTree(tree(cond('a', 'A'), group('g', 'and', [cond('b', 'B'), cond('c', 'C')])));
		expect(result.children.map(c => c.id)).toEqual(['a', 'b', 'c']);
	});

	it('preserves an or-group inside the root and', () => {
		const result = normalizeTree(tree(cond('a', 'A'), group('g', 'or', [cond('b', 'B'), cond('c', 'C')])));
		expect(result.children).toHaveLength(2);
		expect(result.children[1]).toMatchObject({ kind: 'group', join: 'or' });
	});

	it('forces the root back to and when an or group swallows it', () => {
		const orRoot = { kind: 'group', id: 'root', join: 'or', children: [cond('a', 'A'), cond('b', 'B')] } as unknown as FilterTree;
		const result = normalizeTree(orRoot);
		expect(result.join).toBe('and');
		expect(result.children).toHaveLength(1);
		expect(result.children[0]).toMatchObject({ kind: 'group', join: 'or' });
	});

	it('is idempotent', () => {
		const once = normalizeTree(tree(cond('a', 'A'), group('g', 'or', [cond('b', 'B'), cond('c', 'C')])));
		expect(normalizeTree(once)).toEqual(once);
	});

	it('leaves an empty root empty rather than inventing a row', () => {
		expect(normalizeTree(tree()).children).toEqual([]);
	});
});


describe('ensureNonEmpty', () => {
	it('adds a blank row to an empty tree', () => {
		expect(ensureNonEmpty(tree()).children).toHaveLength(1);
	});

	it('leaves a populated tree alone', () => {
		const t = tree(cond('a', 'A'));
		expect(ensureNonEmpty(t)).toBe(t);
	});
});


describe('addAnd', () => {
	it('inserts a sibling directly after the clicked root row', () => {
		const result = addAnd(tree(cond('a', 'A'), cond('d', 'D')), 'a');
		expect(result.children.map(c => (c as FilterConditionNode).field)).toEqual(['A', '', 'D']);
	});

	it('appends at root level when raised from inside an OR branch, not into the group', () => {
		const t = tree(cond('a', 'A'), group('g', 'or', [cond('b', 'B'), cond('c', 'C')]), cond('d', 'D'));
		const result = addAnd(t, 'c');
		expect(result.children).toHaveLength(4);
		// The OR group is untouched; the blank landed after the whole group.
		expect((result.children[1] as FilterGroupNode).children).toHaveLength(2);
		expect((result.children[2] as FilterConditionNode).field).toBe('');
	});

	it('seeds a row into an empty tree', () => {
		expect(addAnd(tree()).children).toHaveLength(1);
	});
});


describe('addOr', () => {
	// The spec's §4.4 worked example, verbatim:
	//   A && (B || C) && D  --OR on B-->  A && (B || C || E) && D
	it('appends at the END of an existing OR group (spec §4.4)', () => {
		const t = tree(cond('a', 'A'), group('g', 'or', [cond('b', 'B'), cond('c', 'C')]), cond('d', 'D'));
		const result = addOr(t, 'b');
		expect(result.children).toHaveLength(3);
		const or = result.children[1] as FilterGroupNode;
		expect(or.children.map(c => (c as FilterConditionNode).field)).toEqual(['B', 'C', '']);
		expect(fieldsOf(result)).toEqual(['A', 'B', 'C', '', 'D']);
	});

	it('appends at the end even when raised from the LAST branch', () => {
		const t = tree(group('g', 'or', [cond('b', 'B'), cond('c', 'C')]));
		const or = addOr(t, 'c').children[0] as FilterGroupNode;
		expect(or.children.map(c => (c as FilterConditionNode).field)).toEqual(['B', 'C', '']);
	});

	it('wraps a plain root condition into a new OR group', () => {
		const result = addOr(tree(cond('a', 'A'), cond('d', 'D')), 'a');
		expect(result.children).toHaveLength(2);
		const or = result.children[0] as FilterGroupNode;
		expect(or.join).toBe('or');
		expect(or.children.map(c => (c as FilterConditionNode).field)).toEqual(['A', '']);
	});

	it('twice in a row grows the same group rather than nesting', () => {
		let t = addOr(tree(cond('a', 'A')), 'a');
		const firstBranch = (t.children[0] as FilterGroupNode).children[1];
		t = addOr(t, firstBranch.id);
		const or = t.children[0] as FilterGroupNode;
		expect(or.children).toHaveLength(3);
		expect(or.children.every(c => c.kind === 'condition')).toBe(true);
	});
});


describe('removeNode', () => {
	it('collapses an OR group down to a bare condition when one branch is left', () => {
		const t = tree(cond('a', 'A'), group('g', 'or', [cond('b', 'B'), cond('c', 'C')]));
		const result = removeNode(t, 'c');
		expect(result.children.map(c => c.id)).toEqual(['a', 'b']);
		expect(result.children[1].kind).toBe('condition');
	});

	it('removes a middle branch and keeps the group', () => {
		const t = tree(group('g', 'or', [cond('b', 'B'), cond('c', 'C'), cond('e', 'E')]));
		const or = removeNode(t, 'c').children[0] as FilterGroupNode;
		expect(or.children.map(c => c.id)).toEqual(['b', 'e']);
	});

	it('leaves an empty root when the last condition goes', () => {
		expect(removeNode(tree(cond('a', 'A')), 'a').children).toEqual([]);
	});

	it('shares untouched nodes by reference', () => {
		const keep = cond('a', 'A');
		const result = removeNode(tree(keep, cond('b', 'B')), 'b');
		expect(result.children[0]).toBe(keep);
	});
});


describe('updateCondition / field and operator changes', () => {
	it('patches one node and leaves siblings referentially equal', () => {
		const keep = cond('a', 'A');
		const result = updateCondition(tree(keep, cond('b', 'B')), 'b', { values: ['x'] });
		expect(result.children[0]).toBe(keep);
		expect((result.children[1] as FilterConditionNode).values).toEqual(['x']);
	});

	it('reaches a condition nested in an OR group', () => {
		const t = tree(group('g', 'or', [cond('b', 'B'), cond('c', 'C')]));
		const result = updateCondition(t, 'c', { field: 'Z' });
		expect(((result.children[0] as FilterGroupNode).children[1] as FilterConditionNode).field).toBe('Z');
	});

	it('resets the operator and value on a field change', () => {
		expect(applyFieldChange('name', 'text')).toEqual({ field: 'name', operator: '*', values: [] });
		expect(applyFieldChange('age', 'number')).toEqual({ field: 'age', operator: '=', values: [] });
	});

	it('clears values when the operator stops taking one', () => {
		expect(applyOperatorChange(cond('a', 'A', '=', ['x']), 'is_set')).toEqual({ operator: 'is_set', values: [] });
	});

	it('clears values when crossing the single/multi boundary', () => {
		expect(applyOperatorChange(cond('a', 'A', '=', ['x']), 'in')).toEqual({ operator: 'in', values: [] });
		expect(applyOperatorChange(cond('a', 'A', 'in', ['x', 'y']), '=')).toEqual({ operator: '=', values: [] });
	});

	it('keeps the value within the same value arity', () => {
		expect(applyOperatorChange(cond('a', 'A', '=', ['x']), '!=')).toEqual({ operator: '!=' });
		expect(applyOperatorChange(cond('a', 'A', 'in', ['x']), 'not_in')).toEqual({ operator: 'not_in' });
	});
});


describe('upsertRootCondition', () => {
	it('replaces a row on the same field and operator', () => {
		const t = tree(cond('a', 'name', '*', ['foo']));
		const result = upsertRootCondition(t, { field: 'name', operator: '*', values: ['bar'] });
		expect(result.children).toHaveLength(1);
		expect((result.children[0] as FilterConditionNode).values).toEqual(['bar']);
		expect(result.children[0].id).toBe('a');
	});

	it('appends when the operator differs, so `age > 5 && age < 10` is possible', () => {
		const t = tree(cond('a', 'age', '>', [5]));
		const result = upsertRootCondition(t, { field: 'age', operator: '<', values: [10] });
		expect(result.children).toHaveLength(2);
	});

	it('takes over the blank placeholder row rather than appending beneath it', () => {
		const t = tree(makeBlankCondition());
		const result = upsertRootCondition(t, { field: 'name', operator: '*', values: ['x'] });
		expect(result.children).toHaveLength(1);
		expect((result.children[0] as FilterConditionNode).field).toBe('name');
	});

	it('never overwrites a locked row', () => {
		const locked: FilterConditionNode = { ...cond('l', 'name', '*', ['scoped']), locked: true };
		const result = upsertRootCondition(tree(locked), { field: 'name', operator: '*', values: ['user'] });
		expect(result.children).toHaveLength(2);
		expect((result.children[0] as FilterConditionNode).values).toEqual(['scoped']);
	});
});


describe('removeRootCondition', () => {
	it('removes a matching row', () => {
		const t = tree(cond('a', 'name', '*', ['foo']), cond('b', 'age', '=', [3]));
		expect(removeRootCondition(t, 'name', '*').children.map(c => c.id)).toEqual(['b']);
	});

	it('is a no-op when nothing matches', () => {
		const t = tree(cond('a', 'name', '*', ['foo']));
		expect(removeRootCondition(t, 'age', '=')).toBe(t);
	});
});


describe('validateTree', () => {
	it('exempts an untouched blank row, so a fresh panel can be applied', () => {
		expect(validateTree(tree(makeBlankCondition()))).toEqual([]);
	});

	it('flags a field with no value', () => {
		const issues = validateTree(tree(cond('a', 'name', '*', [])));
		expect(issues).toEqual([{ nodeId: 'a', reason: 'noValue' }]);
	});

	it('flags a value typed with no field chosen', () => {
		const issues = validateTree(tree(cond('a', '', '=', ['x'])));
		expect(issues).toEqual([{ nodeId: 'a', reason: 'noField' }]);
	});

	it('accepts a presence operator with no value', () => {
		expect(validateTree(tree(cond('a', 'note', 'is_set', [])))).toEqual([]);
	});

	it('reaches conditions inside OR groups', () => {
		const t = tree(group('g', 'or', [cond('b', 'B', '=', ['x']), cond('c', 'C', '=', [])]));
		expect(validateTree(t)).toEqual([{ nodeId: 'c', reason: 'noValue' }]);
	});

	it('ignores locked rows', () => {
		const locked: FilterConditionNode = { ...cond('l', 'scope', '=', []), locked: true };
		expect(validateTree(tree(locked))).toEqual([]);
	});
});


describe('isCompleteCondition', () => {
	it('rejects empty-string and null values', () => {
		expect(isCompleteCondition(cond('a', 'name', '=', ['']))).toBe(false);
		expect(isCompleteCondition(cond('a', 'name', '=', [null]))).toBe(false);
	});

	it('accepts false and zero, which are real values', () => {
		expect(isCompleteCondition(cond('a', 'active', '=', [false]))).toBe(true);
		expect(isCompleteCondition(cond('a', 'count', '=', [0]))).toBe(true);
	});
});


describe('flattenForRender', () => {
	it('gives join buttons to root rows and the first OR branch only', () => {
		const t = tree(cond('a', 'A'), group('g', 'or', [cond('b', 'B'), cond('c', 'C'), cond('e', 'E')]), cond('d', 'D'));
		const rows = flattenForRender(t);
		expect(rows.map(r => r.node.field)).toEqual(['A', 'B', 'C', 'E', 'D']);
		expect(rows.map(r => r.showJoinButtons)).toEqual([true, true, false, false, true]);
		expect(rows.map(r => r.isOrBranch)).toEqual([false, false, true, true, false]);
		expect(rows.map(r => r.depth)).toEqual([0, 0, 1, 1, 0]);
	});

	it('marks every root entry after the first as an AND branch', () => {
		const t = tree(cond('a', 'A'), group('g', 'or', [cond('b', 'B'), cond('c', 'C')]), cond('d', 'D'));
		// B opens the second root entry, so it is joined by `and`; C is joined by `or` instead.
		expect(flattenForRender(t).map(r => r.isAndBranch)).toEqual([false, true, false, true]);
	});

	it('leaves a lone condition unmarked', () => {
		expect(flattenForRender(tree(cond('a', 'A'))).map(r => r.isAndBranch)).toEqual([false]);
	});

	it('marks locked rows', () => {
		const locked: FilterConditionNode = { ...cond('l', 'scope'), locked: true };
		expect(flattenForRender(tree(locked, cond('a', 'A'))).map(r => r.locked)).toEqual([true, false]);
	});
});


describe('findPath', () => {
	it('returns the chain from root to the node', () => {
		const t = tree(group('g', 'or', [cond('b', 'B')]));
		expect(findPath(t, 'b')?.map(n => n.id)).toEqual(['root', 'g', 'b']);
	});

	it('returns null for an unknown id', () => {
		expect(findPath(tree(cond('a', 'A')), 'nope')).toBeNull();
	});
});

/**
 * The Enter-to-apply path in `FilterPanel`.
 *
 * Enter is handled where the keystroke lands — in the row — but applied at the panel, so the
 * tree travels up through `updateCondition` instead of through the state write. These pin the
 * two properties that path depends on: the patched tree carries the new value immediately, and
 * it validates exactly as the Apply button's tree would.
 */
describe('enter-to-apply', () => {
	it('carries the typed value without waiting for a state write', () => {
		const tree: FilterTree = { kind: 'group', id: 'root', join: 'and', children: [cond('a', 'name', '*', [])] };
		// What the row computes on Enter, from the props it currently holds.
		const submitted = updateCondition(tree, 'a', { values: ['acme'] });
		expect((submitted.children[0] as FilterConditionNode).values).toEqual(['acme']);
		// The tree still in props is untouched — applying *that* is the bug this path avoids.
		expect((tree.children[0] as FilterConditionNode).values).toEqual([]);
	});

	it('validates the submitted tree, so Enter cannot apply what Apply would reject', () => {
		const tree: FilterTree = { kind: 'group', id: 'root', join: 'and', children: [cond('a', 'name', '*', [])] };
		// A field chosen but the value cleared: Enter here must surface the same error the
		// button does, not publish an incomplete condition.
		expect(validateTree(ensureNonEmpty(updateCondition(tree, 'a', { values: [''] }))))
			.toEqual([{ nodeId: 'a', reason: 'noValue' }]);
		// And with a real value it is clean, so Enter applies.
		expect(validateTree(ensureNonEmpty(updateCondition(tree, 'a', { values: ['acme'] })))).toEqual([]);
	});
});
