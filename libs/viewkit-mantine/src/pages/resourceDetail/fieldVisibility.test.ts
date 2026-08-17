import { describe, expect, it } from 'vitest';

import { hasVisibleField, isFieldVisible } from './fieldVisibility';

import type * as dyn from '@nikkierp/common/dynamicModel';


function field(
	name: string, dataType: dyn.ModelSchemaFieldDataTypeName, extra: Partial<dyn.ModelSchemaField> = {},
): dyn.ModelSchemaField {
	return { name, label: { 'en-US': name }, data_type: { name: dataType }, ...extra } as dyn.ModelSchemaField;
}

/** Modelled on `iam_role`, whose live schema motivated every rule here. */
const roleSchema = {
	name: 'iam_role',
	fields: {
		id: field('id', 'ulid', { is_primary_key: true, is_system_field: true, is_auto_generated: true }),
		etag: field('etag', 'nikkiEtag', { is_system_field: true }),
		name: field('name', 'string', { is_required_for_create: true }),
		description: field('description', 'string'),
		org_id: field('org_id', 'ulid'),
		// A foreign key is a system field, yet picking one is the whole point of a create form.
		owner_user_id: field('owner_user_id', 'ulid', { is_foreign_key: true, is_system_field: true }),
		created_at: field('created_at', 'nikkiDateTime', { is_auto_generated: true }),
		expires_at: field('expires_at', 'nikkiDateTime'),
		assigned_users: field('assigned_users', 'model', { is_edge_model: true, is_computed: true }),
		// Copied from a related record on read; read-only, but not server-owned.
		owner_name: field('owner_name', 'string', { is_computed: true, is_virtual: true }),
	},
} as unknown as dyn.ModelSchema;

describe('isFieldVisible', () => {
	it('hides a field the schema does not define, in every mode', () => {
		expect(isFieldVisible(roleSchema, 'nope', 'create')).toBe(false);
		expect(isFieldVisible(roleSchema, 'nope', 'update')).toBe(false);
		expect(isFieldVisible(roleSchema, 'nope', 'read', { nope: 'x' })).toBe(false);
	});

	it('shows ordinary editable fields in both form modes', () => {
		for (const mode of ['create', 'update'] as const) {
			expect(isFieldVisible(roleSchema, 'name', mode)).toBe(true);
			expect(isFieldVisible(roleSchema, 'org_id', mode)).toBe(true);
			expect(isFieldVisible(roleSchema, 'owner_user_id', mode)).toBe(true);
		}
	});

	it('never offers the primary key as an input', () => {
		expect(isFieldVisible(roleSchema, 'id', 'create')).toBe(false);
		expect(isFieldVisible(roleSchema, 'id', 'update')).toBe(false);
	});

	it('hides system fields on create but not merely because they are system on update', () => {
		expect(isFieldVisible(roleSchema, 'etag', 'create')).toBe(false);
		// etag is still hidden on update, but for want of a renderer rather than its system flag.
		expect(isFieldVisible(roleSchema, 'etag', 'update')).toBe(false);
	});

	it('hides a type no form input can render', () => {
		expect(isFieldVisible(roleSchema, 'assigned_users', 'create')).toBe(false);
		expect(isFieldVisible(roleSchema, 'assigned_users', 'update')).toBe(false);
	});

	it('never offers a computed field, whose value the server refuses to accept', () => {
		expect(isFieldVisible(roleSchema, 'owner_name', 'create')).toBe(false);
		expect(isFieldVisible(roleSchema, 'owner_name', 'update')).toBe(false);
	});

	// A foreign key is flagged system because the server owns its meaning, but choosing the
	// related record is exactly what a create form is for. Hiding it would leave no way to set
	// the relation at all.
	it('offers a foreign key in both form modes despite its system flag', () => {
		expect(isFieldVisible(roleSchema, 'owner_user_id', 'create')).toBe(true);
		expect(isFieldVisible(roleSchema, 'owner_user_id', 'update')).toBe(true);
	});

	it('never offers an input for a server-assigned value, even now that datetimes render', () => {
		expect(isFieldVisible(roleSchema, 'created_at', 'create')).toBe(false);
		expect(isFieldVisible(roleSchema, 'created_at', 'update')).toBe(false);
	});

	it('shows a datetime the user does own', () => {
		expect(isFieldVisible(roleSchema, 'expires_at', 'update')).toBe(true);
	});

	it('shows a read-mode field only when it holds a value', () => {
		expect(isFieldVisible(roleSchema, 'description', 'read', { description: 'Admins' })).toBe(true);
		expect(isFieldVisible(roleSchema, 'description', 'read', { description: '' })).toBe(false);
		expect(isFieldVisible(roleSchema, 'description', 'read', {})).toBe(false);
		expect(isFieldVisible(roleSchema, 'assigned_users', 'read', { assigned_users: [] })).toBe(false);
	});

	it('shows any type in read mode, since display is not limited to form inputs', () => {
		expect(isFieldVisible(roleSchema, 'etag', 'read', { etag: 'v1' })).toBe(true);
	});
});

describe('hasVisibleField', () => {
	it('is false for the audit block, whose fields are all unrenderable on create', () => {
		expect(hasVisibleField(roleSchema, ['created_at'], 'create')).toBe(false);
	});

	it('is true when at least one field survives', () => {
		expect(hasVisibleField(roleSchema, ['id', 'name'], 'create')).toBe(true);
	});

	it('is false for an empty field list', () => {
		expect(hasVisibleField(roleSchema, [], 'create')).toBe(false);
	});
});
