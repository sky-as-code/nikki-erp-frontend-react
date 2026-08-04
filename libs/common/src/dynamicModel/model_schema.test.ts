import { describe, expect, it } from 'vitest';

import {
	buildValidationSchema, findExclusiveGroupPeers, findRelationBySrcField, isRenderableFieldType,
} from './model_schema';

import type { ModelSchema, ModelSchemaField, ModelSchemaFieldDataTypeName } from './model_schema';


function field(name: string, dataType: ModelSchemaFieldDataTypeName, extra: Partial<ModelSchemaField> = {}) {
	return { name, label: { 'en-US': name }, data_type: { name: dataType }, ...extra } as ModelSchemaField;
}

function schema(overrides: Partial<ModelSchema> = {}): ModelSchema {
	return { name: 'iam_role', fields: {}, ...overrides };
}

describe('findRelationBySrcField', () => {
	const roleSchema = schema({
		to_relations: [
			{ edge: 'owner_group', src_field: 'owner_group_id', dest_schema_name: 'iam_group', relation_type: 'many:one' },
			{ edge: 'owner_user', src_field: 'owner_user_id', dest_schema_name: 'iam_user', relation_type: 'many:one' },
			{ edge: 'assigned_users', dest_schema_name: 'iam_user', relation_type: 'many:many' },
		],
	});

	it('finds the relation a foreign-key field owns', () => {
		expect(findRelationBySrcField(roleSchema, 'owner_group_id')?.dest_schema_name).toBe('iam_group');
		expect(findRelationBySrcField(roleSchema, 'owner_user_id')?.dest_schema_name).toBe('iam_user');
	});

	it('returns undefined for a ulid that owns no relation, such as org_id', () => {
		expect(findRelationBySrcField(roleSchema, 'org_id')).toBeUndefined();
	});

	it('never matches a many-to-many edge, which carries no src_field', () => {
		expect(findRelationBySrcField(roleSchema, 'assigned_users')).toBeUndefined();
		expect(findRelationBySrcField(schema(), 'anything')).toBeUndefined();
	});
});

describe('findExclusiveGroupPeers', () => {
	const roleSchema = schema({
		exclusive_required_field_groups: [['owner_group_id', 'owner_user_id']],
	});

	it('returns the other members of the group', () => {
		expect(findExclusiveGroupPeers(roleSchema, 'owner_user_id')).toEqual(['owner_group_id']);
		expect(findExclusiveGroupPeers(roleSchema, 'owner_group_id')).toEqual(['owner_user_id']);
	});

	it('returns nothing for a field in no group, or when the schema declares none', () => {
		expect(findExclusiveGroupPeers(roleSchema, 'name')).toEqual([]);
		expect(findExclusiveGroupPeers(schema(), 'owner_user_id')).toEqual([]);
	});

	it('unions the groups of a field that belongs to several, without repeating itself', () => {
		const multi = schema({ exclusive_required_field_groups: [['a', 'b'], ['a', 'c']] });
		expect(findExclusiveGroupPeers(multi, 'a').sort()).toEqual(['b', 'c']);
	});
});

describe('isRenderableFieldType', () => {
	// Guards the pairing with AutoField's switch: a type here with no case renders an empty slot,
	// and a case missing from here hides a field that would have rendered.
	const renderable: ModelSchemaFieldDataTypeName[] = [
		'boolean', 'email', 'int32', 'nikkiDate', 'nikkiDateTime', 'nikkiLangJson', 'nikkiTime',
		'secret', 'string', 'ulid',
	];
	const notRenderable: ModelSchemaFieldDataTypeName[] = [
		'decimal', 'enumInt32', 'int64', 'jsonmap', 'model', 'nikkiEtag', 'nikkiLangCode',
		'nikkiSlug', 'phone', 'url', 'uuid',
	];

	it.each(renderable)('renders %s', dataType => {
		expect(isRenderableFieldType(field('x', dataType))).toBe(true);
	});

	it.each(notRenderable)('does not render %s', dataType => {
		expect(isRenderableFieldType(field('x', dataType))).toBe(false);
	});

	it('renders an enumString only when it carries the values to choose from', () => {
		const withValues = field('status', 'enumString', {
			data_type: { name: 'enumString', options: { enumValues: ['active'] } },
		});
		expect(isRenderableFieldType(withValues)).toBe(true);
		expect(isRenderableFieldType(field('status', 'enumString'))).toBe(false);
	});
});

describe('buildValidationSchema: blank optional fields', () => {
	const formSchema = schema({
		fields: {
			name: field('name', 'string', { is_required_for_create: true }),
			org_id: field('org_id', 'ulid'),
			owner_user_id: field('owner_user_id', 'ulid'),
			count: field('count', 'int32'),
			flag: field('flag', 'boolean'),
		},
	});

	/**
	 * An untouched text input submits `''`, which is not a ULID. Validating it directly reported
	 * "invalid data type" on a field the user was entitled to leave alone.
	 */
	it('accepts an empty optional ulid and leaves the key out of the payload', () => {
		const parsed = buildValidationSchema(formSchema).safeParse({ name: 'Admin', org_id: '' });

		expect(parsed.success).toBe(true);
		expect(Object.hasOwn(parsed.data as object, 'org_id')).toBe(false);
		expect(parsed.data).toEqual({ name: 'Admin' });
	});

	it('treats a cleared select the same as an untouched input', () => {
		const parsed = buildValidationSchema(formSchema).safeParse({
			name: 'Admin', owner_user_id: null, org_id: '   ',
		});

		expect(parsed.success).toBe(true);
		expect(parsed.data).toEqual({ name: 'Admin' });
	});

	it('keeps a value the user did provide', () => {
		const id = '01JWNMZ36QHC7CQQ748H9NQ6J6';
		const parsed = buildValidationSchema(formSchema).safeParse({ name: 'Admin', org_id: id });

		expect(parsed.success).toBe(true);
		expect((parsed.data as Record<string, unknown>).org_id).toBe(id);
	});

	it('still rejects a malformed ulid rather than silently dropping it', () => {
		const parsed = buildValidationSchema(formSchema).safeParse({ name: 'Admin', org_id: 'nope' });

		expect(parsed.success).toBe(false);
	});

	// `0` and `false` are real values, not blanks — a narrower predicate than the required-check's.
	it('keeps zero and false', () => {
		const parsed = buildValidationSchema(formSchema).safeParse({ name: 'Admin', count: 0, flag: false });

		expect(parsed.success).toBe(true);
		expect(parsed.data).toEqual({ name: 'Admin', count: 0, flag: false });
	});

	it('still reports a missing required field', () => {
		const parsed = buildValidationSchema(formSchema).safeParse({ name: '' });

		expect(parsed.success).toBe(false);
	});
});
