import { describe, expect, it } from 'vitest';

import {
	applyVisibleWhen, fieldPresentation, hasVisibleField, isBlockVisible, isFieldShownByCondition, isFieldVisible,
	visibleWhenSourceFields,
} from './fieldVisibility';

import type { VisibleWhen } from './fieldVisibility';
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
		// Writable at create, frozen afterwards: the server rejects an update to it.
		reference_code: field('reference_code', 'string', { no_update: true }),
		// An enum carrying no values renders nothing, in any mode.
		valueless_enum: field('valueless_enum', 'enumString'),
	},
} as unknown as dyn.ModelSchema;

describe('org_id', () => {
	it('is never shown, in any mode or presentation', () => {
		for (const mode of ['create', 'update', 'read'] as const) {
			expect(isFieldVisible(roleSchema, 'org_id', mode)).toBe(false);
			expect(fieldPresentation(roleSchema, 'org_id', mode, true)).toBe('hidden');
		}
		expect(isBlockVisible(roleSchema, ['org_id'], 'read')).toBe(false);
	});
});

describe('isFieldVisible', () => {
	it('hides a field the schema does not define, in every mode', () => {
		expect(isFieldVisible(roleSchema, 'nope', 'create')).toBe(false);
		expect(isFieldVisible(roleSchema, 'nope', 'update')).toBe(false);
		expect(isFieldVisible(roleSchema, 'nope', 'read')).toBe(false);
	});

	it('shows ordinary editable fields in both form modes', () => {
		for (const mode of ['create', 'update'] as const) {
			expect(isFieldVisible(roleSchema, 'name', mode)).toBe(true);
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

	it('shows a read-mode field whether or not the record holds a value', () => {
		expect(isFieldVisible(roleSchema, 'description', 'read')).toBe(true);
		expect(isFieldVisible(roleSchema, 'assigned_users', 'read')).toBe(true);
	});

	it('shows any type in read mode, since display is not limited to form inputs', () => {
		expect(isFieldVisible(roleSchema, 'etag', 'read')).toBe(true);
		// The same field a form refuses to offer an input for still displays.
		expect(isFieldVisible(roleSchema, 'valueless_enum', 'update')).toBe(false);
		expect(isFieldVisible(roleSchema, 'valueless_enum', 'read')).toBe(true);
	});
});

describe('isFieldVisible: no_update', () => {
	it('hides a no_update field in update mode only', () => {
		expect(isFieldVisible(roleSchema, 'reference_code', 'update')).toBe(false);
		expect(isFieldVisible(roleSchema, 'reference_code', 'create')).toBe(true);
		expect(isFieldVisible(roleSchema, 'reference_code', 'read')).toBe(true);
	});

	it('leaves a plain field visible in every mode', () => {
		expect(isFieldVisible(roleSchema, 'description', 'update')).toBe(true);
		expect(isFieldVisible(roleSchema, 'description', 'create')).toBe(true);
		expect(isFieldVisible(roleSchema, 'description', 'read')).toBe(true);
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

describe('fieldPresentation', () => {
	it('shows every listed field read-only in read mode, and drops an undefined one', () => {
		expect(fieldPresentation(roleSchema, 'created_at', 'read')).toBe('readonly');
		expect(fieldPresentation(roleSchema, 'nope', 'read', true)).toBe('hidden');
	});

	it('keeps an uneditable field read-only in update mode, with or without a stable layout', () => {
		expect(fieldPresentation(roleSchema, 'reference_code', 'update')).toBe('readonly');
		expect(fieldPresentation(roleSchema, 'owner_name', 'update', true)).toBe('readonly');
		expect(fieldPresentation(roleSchema, 'description', 'update', true)).toBe('input');
	});

	it('hides an uneditable field on create unless the layout is stable', () => {
		expect(fieldPresentation(roleSchema, 'created_at', 'create')).toBe('hidden');
		expect(fieldPresentation(roleSchema, 'created_at', 'create', true)).toBe('readonly');
		expect(fieldPresentation(roleSchema, 'name', 'create', true)).toBe('input');
	});
});

describe('isBlockVisible', () => {
	it('drops a block with nothing editable unless the layout is stable', () => {
		expect(isBlockVisible(roleSchema, ['created_at'], 'create')).toBe(false);
		expect(isBlockVisible(roleSchema, ['created_at', 'owner_name'], 'update')).toBe(false);
		expect(isBlockVisible(roleSchema, ['created_at'], 'create', true)).toBe(true);
		expect(isBlockVisible(roleSchema, ['created_at', 'owner_name'], 'update', true)).toBe(true);
	});

	it('still drops a stable block whose fields the schema does not define', () => {
		expect(isBlockVisible(roleSchema, ['nope'], 'update', true)).toBe(false);
	});
});

const flowRules: VisibleWhen = {
	receiving_location_id: { field: 'incoming_flow', operator: 'in', value: ['two_step', 'three_step'] },
	quality_location_id: [
		{ field: 'incoming_flow', operator: 'equal', value: 'three_step' },
		{ field: 'parent.kind', operator: 'exists' },
	],
};

describe('isFieldShownByCondition', () => {
	it('shows a field that has no rule', () => {
		expect(isFieldShownByCondition(flowRules, 'name', {})).toBe(true);
		expect(isFieldShownByCondition(undefined, 'name', {})).toBe(true);
	});

	it('follows a single condition', () => {
		expect(isFieldShownByCondition(flowRules, 'receiving_location_id', { incoming_flow: 'two_step' })).toBe(true);
		expect(isFieldShownByCondition(flowRules, 'receiving_location_id', { incoming_flow: 'one_step' })).toBe(false);
	});

	it('requires every condition of a list', () => {
		const values = { incoming_flow: 'three_step', parent: { kind: 'x' } };
		expect(isFieldShownByCondition(flowRules, 'quality_location_id', values)).toBe(true);
		expect(isFieldShownByCondition(flowRules, 'quality_location_id', { incoming_flow: 'three_step' })).toBe(false);
	});
});

describe('visibleWhenSourceFields', () => {
	it('lists each top-level field a condition reads, once', () => {
		expect(visibleWhenSourceFields(flowRules)).toEqual(['incoming_flow', 'parent']);
		expect(visibleWhenSourceFields(undefined)).toEqual([]);
	});
});

describe('applyVisibleWhen', () => {
	it('drops plain fields whose condition fails', () => {
		const fields = ['incoming_flow', 'receiving_location_id', 'quality_location_id'];
		expect(applyVisibleWhen(fields, flowRules, { incoming_flow: 'one_step' })).toEqual(['incoming_flow']);
		expect(applyVisibleWhen(fields, flowRules, { incoming_flow: 'two_step' }))
			.toEqual(['incoming_flow', 'receiving_location_id']);
	});

	it('drops a failing @@field from an inline row, and the row once none is left', () => {
		const rows = [['$$form.input', '@@receiving_location_id', 'and', '@@quality_location_id'], ['$$form.note']];
		expect(applyVisibleWhen(rows, flowRules, { incoming_flow: 'two_step' }))
			.toEqual([['$$form.input', '@@receiving_location_id', 'and'], ['$$form.note']]);
		expect(applyVisibleWhen(rows, flowRules, { incoming_flow: 'one_step' })).toEqual([['$$form.note']]);
	});

	it('leaves the fields alone without rules', () => {
		expect(applyVisibleWhen(['a', ['@@b']], undefined, {})).toEqual(['a', ['@@b']]);
	});
});
