import { describe, expect, it } from 'vitest';

import {
	buildClauseFromInput, buildSearchGraph, getDefaultOperator, getEnumOptions,
	getFilterInputKind, getFilterableFieldNames, getGraphOrder, getOperatorsForKind,
	isCompleteClause, isFilterableField, isTextLikeKind, parseFilterExpression,
} from './filterModel';

import type { FilterClause } from './filterModel';
import type * as dyn from '@nikkierp/common/dynamicModel';


function field(
	name: string,
	dataTypeName: dyn.ModelSchemaFieldDataTypeName,
	extra: Partial<dyn.ModelSchemaField> = {},
	options?: dyn.ModelSchemaFieldDataType['options'],
): dyn.ModelSchemaField {
	return {
		name,
		label: { 'en-US': name },
		data_type: { name: dataTypeName, ...(options ? { options } : {}) },
		...extra,
	};
}


describe('getFilterInputKind', () => {
	it('maps each data type family to its input kind', () => {
		expect(getFilterInputKind(field('name', 'string'))).toBe('text');
		expect(getFilterInputKind(field('email', 'email'))).toBe('text');
		expect(getFilterInputKind(field('id', 'ulid'))).toBe('text');
		expect(getFilterInputKind(field('qty', 'int32'))).toBe('number');
		expect(getFilterInputKind(field('price', 'decimal'))).toBe('number');
		expect(getFilterInputKind(field('at', 'nikkiDateTime'))).toBe('date');
		expect(getFilterInputKind(field('flag', 'boolean'))).toBe('boolean');
		expect(getFilterInputKind(field('status', 'enumString'))).toBe('enum');
		expect(getFilterInputKind(field('level', 'enumInt32'))).toBe('enum');
	});

	it('treats translatable text as its own kind', () => {
		// The backend filters `column ->> language`, so it is filterable — but only by the
		// string operators.
		expect(getFilterInputKind(field('name', 'nikkiLangJson'))).toBe('langText');
	});

	it('reports types no input can express as unsupported', () => {
		expect(getFilterInputKind(field('owner', 'model'))).toBe('unsupported');
		expect(getFilterInputKind(field('meta', 'jsonmap'))).toBe('unsupported');
		expect(getFilterInputKind(field('password', 'secret'))).toBe('unsupported');
		expect(getFilterInputKind(undefined)).toBe('unsupported');
	});
});

describe('langText fields', () => {
	const nameField = field('name', 'nikkiLangJson');

	it('is filterable', () => {
		// A resource's own name is usually the first thing anyone filters on.
		expect(isFilterableField(nameField)).toBe(true);
	});

	it('defaults to contains, like plain text', () => {
		expect(getDefaultOperator('langText')).toBe('*');
		expect(parseFilterExpression('cola', 'langText')).toEqual({ operator: '*', values: ['cola'] });
	});

	it('offers only the operators that reach the string predicate', () => {
		const operators = getOperatorsForKind('langText');
		expect(operators).toEqual(expect.arrayContaining(['*', '!*', '^', '!^', '$', '!$']));
		// Equality and collection operators compare the whole jsonb value, which never matches
		// a plain string — offering them would build a filter that silently returns nothing.
		expect(operators).not.toContain('=');
		expect(operators).not.toContain('!=');
		expect(operators).not.toContain('in');
		expect(operators).not.toContain('not_in');
	});

	it('is edited as free text', () => {
		expect(isTextLikeKind('langText')).toBe(true);
		expect(isTextLikeKind('text')).toBe(true);
		expect(isTextLikeKind('number')).toBe(false);
		expect(isTextLikeKind('enum')).toBe(false);
	});
});

describe('isFilterableField', () => {
	it('accepts an ordinary persisted column', () => {
		expect(isFilterableField(field('name', 'string'))).toBe(true);
		expect(isFilterableField(field('name', 'string', { is_persisted: true }))).toBe(true);
	});

	it('rejects a field with no database column', () => {
		// Nothing can appear in a WHERE clause without a column to name.
		expect(isFilterableField(field('total', 'int32', { is_persisted: false }))).toBe(false);
	});

	it('rejects an edge and an unsupported type', () => {
		expect(isFilterableField(field('roles', 'model', { is_edge_model: true }))).toBe(false);
		expect(isFilterableField(field('meta', 'jsonmap'))).toBe(false);
	});

	it('keeps a computed field that still has a column', () => {
		expect(isFilterableField(field('count', 'int32', { is_computed: true, is_persisted: true })))
			.toBe(true);
	});
});

describe('getFilterableFieldNames', () => {
	it('returns filterable names in declaration order', () => {
		const schema = {
			name: 'inventory_product_template',
			fields: {
				name: field('name', 'string'),
				meta: field('meta', 'jsonmap'),
				qty: field('qty', 'int32'),
				owner: field('owner', 'model', { is_edge_model: true }),
			},
		} as unknown as dyn.ModelSchema;
		expect(getFilterableFieldNames(schema)).toEqual(['name', 'qty']);
	});

	it('tolerates a missing schema', () => {
		expect(getFilterableFieldNames(undefined)).toEqual([]);
	});
});

describe('getEnumOptions', () => {
	it('reads string and numeric enum values', () => {
		expect(getEnumOptions(field('s', 'enumString', {}, { enumValues: ['a', 'b'] })))
			.toEqual(['a', 'b']);
		expect(getEnumOptions(field('n', 'enumInt32', {}, { enumValues: [1, 2] })))
			.toEqual(['1', '2']);
	});

	it('returns nothing when the schema declares no values', () => {
		expect(getEnumOptions(field('s', 'enumString'))).toEqual([]);
		expect(getEnumOptions(field('s', 'enumString', {}, { enumValues: 'nope' as unknown as [] })))
			.toEqual([]);
	});
});

describe('getDefaultOperator', () => {
	it('uses contains for text and equality for everything else', () => {
		// `LIKE` against a numeric or temporal column is not a meaningful question.
		expect(getDefaultOperator('text')).toBe('*');
		expect(getDefaultOperator('number')).toBe('=');
		expect(getDefaultOperator('date')).toBe('=');
		expect(getDefaultOperator('boolean')).toBe('=');
		expect(getDefaultOperator('enum')).toBe('=');
	});
});

describe('getOperatorsForKind', () => {
	it('offers string operators to text and comparisons to numbers', () => {
		expect(getOperatorsForKind('text')).toContain('*');
		expect(getOperatorsForKind('text')).toContain('^');
		expect(getOperatorsForKind('number')).toContain('>=');
		expect(getOperatorsForKind('number')).not.toContain('*');
	});

	it('always offers the presence operators', () => {
		for (const kind of ['text', 'number', 'date', 'boolean', 'enum', 'unsupported'] as const) {
			expect(getOperatorsForKind(kind)).toEqual(expect.arrayContaining(['is_set', 'not_set']));
		}
	});

	it('never offers the edge-only operators', () => {
		for (const kind of ['text', 'number', 'date', 'boolean', 'enum'] as const) {
			expect(getOperatorsForKind(kind)).not.toContain('linked');
			expect(getOperatorsForKind(kind)).not.toContain('not_linked');
		}
	});
});

describe('parseFilterExpression', () => {
	it('treats a bare value as the kind default', () => {
		expect(parseFilterExpression('cola', 'text')).toEqual({ operator: '*', values: ['cola'] });
		expect(parseFilterExpression('42', 'number')).toEqual({ operator: '=', values: [42] });
	});

	it('reads every symbolic operator prefix', () => {
		const cases: Array<[string, dyn.SearchOperator, unknown]> = [
			['= cola', '=', 'cola'],
			['!= cola', '!=', 'cola'],
			['* cola', '*', 'cola'],
			['!* cola', '!*', 'cola'],
			['^ cola', '^', 'cola'],
			['!^ cola', '!^', 'cola'],
			['$ cola', '$', 'cola'],
			['!$ cola', '!$', 'cola'],
		];
		for (const [input, operator, value] of cases) {
			expect(parseFilterExpression(input, 'text')).toEqual({ operator, values: [value] });
		}
	});

	it('prefers the longer token when one operator prefixes another', () => {
		// `>= 5` must not parse as `>` with a value of `= 5`.
		expect(parseFilterExpression('>= 5', 'number')).toEqual({ operator: '>=', values: [5] });
		expect(parseFilterExpression('<= 5', 'number')).toEqual({ operator: '<=', values: [5] });
		expect(parseFilterExpression('!= 5', 'number')).toEqual({ operator: '!=', values: [5] });
		expect(parseFilterExpression('> 5', 'number')).toEqual({ operator: '>', values: [5] });
		expect(parseFilterExpression('!* x', 'text')).toEqual({ operator: '!*', values: ['x'] });
	});

	it('parses operators written without a space', () => {
		expect(parseFilterExpression('>=5', 'number')).toEqual({ operator: '>=', values: [5] });
		expect(parseFilterExpression('*cola', 'text')).toEqual({ operator: '*', values: ['cola'] });
	});

	it('splits a list for in / not_in', () => {
		expect(parseFilterExpression('in a, b ,c', 'text'))
			.toEqual({ operator: 'in', values: ['a', 'b', 'c'] });
		expect(parseFilterExpression('not_in 1,2', 'number'))
			.toEqual({ operator: 'not_in', values: [1, 2] });
	});

	it('matches word operators case-insensitively and without operands', () => {
		expect(parseFilterExpression('is_set', 'text')).toEqual({ operator: 'is_set', values: [] });
		expect(parseFilterExpression('IS_SET', 'text')).toEqual({ operator: 'is_set', values: [] });
		expect(parseFilterExpression('not_set', 'text')).toEqual({ operator: 'not_set', values: [] });
	});

	it('does not mistake a word starting with an operator name for that operator', () => {
		// `inside` begins with `in`, but is a value.
		expect(parseFilterExpression('inside', 'text')).toEqual({ operator: '*', values: ['inside'] });
	});
});

describe('parseFilterExpression — incomplete input', () => {
	it('returns null for blank input', () => {
		expect(parseFilterExpression('', 'text')).toBeNull();
		expect(parseFilterExpression('   ', 'text')).toBeNull();
	});

	it('returns null for a half-typed operator', () => {
		// Otherwise every keystroke of `>= 100` fires a request.
		expect(parseFilterExpression('>=', 'number')).toBeNull();
		expect(parseFilterExpression('>= ', 'number')).toBeNull();
		expect(parseFilterExpression('in ,', 'text')).toBeNull();
	});
});

describe('parseFilterExpression — value coercion', () => {
	it('coerces booleans and numbers off the wire-string', () => {
		// A typed column compares against a typed value; "true" and "5" are type errors.
		expect(parseFilterExpression('true', 'boolean')).toEqual({ operator: '=', values: [true] });
		expect(parseFilterExpression('false', 'boolean')).toEqual({ operator: '=', values: [false] });
		expect(parseFilterExpression('7', 'number')).toEqual({ operator: '=', values: [7] });
	});

	it('leaves an unparseable number as a string for the server to reject', () => {
		expect(parseFilterExpression('abc', 'number')).toEqual({ operator: '=', values: ['abc'] });
	});
});

describe('buildClauseFromInput', () => {
	it('keys the clause by its field so edits are stable', () => {
		expect(buildClauseFromInput('name', 'cola', 'text'))
			.toEqual({ key: 'name', field: 'name', operator: '*', values: ['cola'] });
	});

	it('returns null when the cell is cleared', () => {
		expect(buildClauseFromInput('name', '  ', 'text')).toBeNull();
	});
});

describe('isCompleteClause', () => {
	const base: FilterClause = { key: 'k', field: 'name', operator: '*', values: ['x'] };

	it('accepts a valued clause and a presence clause', () => {
		expect(isCompleteClause(base)).toBe(true);
		expect(isCompleteClause({ ...base, operator: 'is_set', values: [] })).toBe(true);
	});

	it('rejects a clause with no field or no value', () => {
		expect(isCompleteClause({ ...base, field: '' })).toBe(false);
		expect(isCompleteClause({ ...base, values: [] })).toBe(false);
		expect(isCompleteClause({ ...base, values: [''] })).toBe(false);
		expect(isCompleteClause({ ...base, values: [null] })).toBe(false);
	});

	it('accepts false as a value', () => {
		// `false` is a legitimate boolean filter, not an empty one.
		expect(isCompleteClause({ ...base, field: 'flag', operator: '=', values: [false] })).toBe(true);
	});
});

describe('buildSearchGraph', () => {
	const nameClause: FilterClause = { key: 'name', field: 'name', operator: '*', values: ['cola'] };
	const qtyClause: FilterClause = { key: 'qty', field: 'qty', operator: '>=', values: [5] };
	const order: dyn.OrderBy = [['name', 'asc']];

	it('expresses a single condition directly rather than as an and-of-one', () => {
		expect(buildSearchGraph([nameClause], [])).toEqual({ if: ['name', '*', 'cola'] });
	});

	it('joins several conditions with and', () => {
		expect(buildSearchGraph([nameClause, qtyClause], [])).toEqual({
			and: [{ if: ['name', '*', 'cola'] }, { if: ['qty', '>=', 5] }],
		});
	});

	it('carries the sort order alongside the conditions', () => {
		expect(buildSearchGraph([nameClause], order)).toEqual({
			if: ['name', '*', 'cola'],
			order: [['name', 'asc']],
		});
	});

	it('returns a sort-only graph when there are no conditions', () => {
		expect(buildSearchGraph([], order)).toEqual({ order: [['name', 'asc']] });
	});

	it('returns undefined when there is nothing to say', () => {
		expect(buildSearchGraph([], [])).toBeUndefined();
	});

	it('drops incomplete clauses instead of sending them', () => {
		const halfTyped: FilterClause = { key: 'x', field: 'x', operator: '=', values: [] };
		expect(buildSearchGraph([nameClause, halfTyped], [])).toEqual({ if: ['name', '*', 'cola'] });
		expect(buildSearchGraph([halfTyped], [])).toBeUndefined();
	});

	it('spreads multi-value operators into the condition tuple', () => {
		const inClause: FilterClause = { key: 's', field: 'status', operator: 'in', values: ['a', 'b'] };
		expect(buildSearchGraph([inClause], [])).toEqual({ if: ['status', 'in', 'a', 'b'] });
	});

	it('emits a presence condition with no value', () => {
		const setClause: FilterClause = { key: 'n', field: 'note', operator: 'is_set', values: [] };
		expect(buildSearchGraph([setClause], [])).toEqual({ if: ['note', 'is_set'] });
	});
});

describe('getGraphOrder', () => {
	it('reads a well-formed order', () => {
		expect(getGraphOrder({ order: [['name', 'asc']] })).toEqual([['name', 'asc']]);
	});

	it('ignores malformed entries and a missing graph', () => {
		expect(getGraphOrder(undefined)).toEqual([]);
		expect(getGraphOrder({})).toEqual([]);
		expect(getGraphOrder({ order: [['name', 'sideways']] as unknown as dyn.OrderBy })).toEqual([]);
	});
});
