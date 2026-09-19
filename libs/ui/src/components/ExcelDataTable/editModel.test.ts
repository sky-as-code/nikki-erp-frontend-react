import { describe, expect, it } from 'vitest';

import { buildRowUpdatePayload, isRowEditableField } from './editModel';

import type * as dyn from '@nikkierp/common/dynamicModel';


const schema = {
	name: 'inventory_product',
	fields: {
		id: { name: 'id', data_type: { name: 'ulid' }, is_primary_key: true },
		name: { name: 'name', data_type: { name: 'string' } },
		created_at: { name: 'created_at', data_type: { name: 'nikkiDateTime' }, is_auto_generated: true },
		total: { name: 'total', data_type: { name: 'decimal' }, is_computed: true },
		code: { name: 'code', data_type: { name: 'string' }, no_update: true },
		category: { name: 'category', data_type: { name: 'model' }, is_edge_model: true },
		status: { name: 'status', data_type: { name: 'enumString', options: { enumValues: ['a', 'b'] } } },
	},
} as unknown as dyn.ModelSchema;

describe('isRowEditableField', () => {
	it('allows plain writable fields and enums with values', () => {
		expect(isRowEditableField(schema, 'name')).toBe(true);
		expect(isRowEditableField(schema, 'status')).toBe(true);
	});

	it('refuses keys, generated, computed, no_update, edge models, dotted and unknown fields', () => {
		for (const field of ['id', 'created_at', 'total', 'code', 'category', 'category.name', 'missing']) {
			expect(isRowEditableField(schema, field)).toBe(false);
		}
		expect(isRowEditableField(undefined, 'name')).toBe(false);
	});
});

describe('buildRowUpdatePayload', () => {
	const item = { id: '01H', etag: 'e1', name: 'Old', status: 'a' };

	it('sends id, etag and only the dirty editable fields', () => {
		const built = buildRowUpdatePayload(
			{ id: '01H', name: 'New', status: 'b', code: 'X' }, { name: true, code: true }, item, ['name', 'status'],
		);
		expect(built.payload).toEqual({ id: '01H', etag: 'e1', name: 'New' });
		expect(built.refusal).toBeUndefined();
	});

	it('reports nothing to write when no editable field changed', () => {
		const built = buildRowUpdatePayload({ name: 'Old' }, {}, item, ['name']);

		expect(built.payload).toBeUndefined();
		expect(built.refusal).toBe('unchanged');
	});

	it('refuses a row with no id', () => {
		const built = buildRowUpdatePayload({ name: 'New' }, { name: true }, { name: 'x' }, ['name']);

		expect(built.payload).toBeUndefined();
		expect(built.refusal).toBe('no-id');
	});

	// The backend forces etag into every read projection, so a row without one predates that and
	// cannot be written under a concurrency check. Saving it anyway would clobber a concurrent edit.
	it('refuses a changed row that carries no etag', () => {
		const built = buildRowUpdatePayload({ name: 'New' }, { name: true }, { id: '01H' }, ['name']);

		expect(built.payload).toBeUndefined();
		expect(built.refusal).toBe('no-etag');
	});

	// An unchanged row is not refused for a missing etag: there is nothing to write either way, and
	// reporting a concurrency problem for a no-op would be noise.
	it('reports unchanged before it reports a missing etag', () => {
		expect(buildRowUpdatePayload({ name: 'Old' }, {}, { id: '01H' }, ['name']).refusal).toBe('unchanged');
	});
});
