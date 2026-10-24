import { describe, expect, it } from 'vitest';

import {
	buildValidationSchema, findComputedDependency, findExclusiveGroupPeers, findRelationBySrcField,
	isFieldFilterable, isFieldSortable, isRenderableFieldType,
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
		'boolean', 'decimal', 'email', 'int32', 'nikkiDate', 'nikkiDateTime', 'nikkiLangJson',
		'nikkiSlug', 'nikkiTime', 'secret', 'string', 'ulid',
	];
	const notRenderable: ModelSchemaFieldDataTypeName[] = [
		'enumInt32', 'int64', 'jsonmap', 'model', 'nikkiEtag', 'nikkiLangCode',
		'phone', 'url', 'uuid',
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

describe('buildValidationSchema: arrays and virtual fields', () => {
	const formSchema = schema({
		fields: {
			sku: field('sku', 'string'),
			tag_ids: { ...field('tag_ids', 'ulid'), data_type: { name: 'ulid', is_array: true } },
			attribute_summary: field('attribute_summary', 'string', {
				is_virtual: true, is_computed: true, is_persisted: false,
			}),
		},
	});

	// The variant form loads `attribute_summary` as a string array; validating it as a string
	// silently blocked every save on a variant with attributes.
	it('does not let a virtual field block a save, whatever shape it arrives in', () => {
		const parsed = buildValidationSchema(formSchema).safeParse({
			sku: 'INV-1', attribute_summary: ['Size: 1500ml'],
		});

		expect(parsed.success).toBe(true);
	});

	it('validates an array field element by element', () => {
		const ulid = '01JWNMZ36QHC7CQQ748H9NQ6J6';
		const valid = buildValidationSchema(formSchema).safeParse({ tag_ids: [ulid] });
		const invalid = buildValidationSchema(formSchema).safeParse({ tag_ids: [ulid, 'nope'] });

		expect(valid.success).toBe(true);
		expect(invalid.success).toBe(false);
	});

	it('rejects a scalar where an array is declared', () => {
		const parsed = buildValidationSchema(formSchema).safeParse({ tag_ids: '01JWNMZ36QHC7CQQ748H9NQ6J6' });

		expect(parsed.success).toBe(false);
	});
});

describe('findComputedDependency', () => {
	const schemaWith = (computed: any): ModelSchema => ({
		name: 'inventory_product_variant',
		fields: {
			sales_tax_mode: { name: 'sales_tax_mode', label: {}, data_type: { type: 'string' } },
			effective_sales_tax_ids: {
				name: 'effective_sales_tax_ids',
				label: {},
				data_type: { type: 'ulid', is_array: true },
				is_computed: true,
				computed,
			},
		},
	} as unknown as ModelSchema);

	it('returns the dependency of a function-computed field', () => {
		const schema = schemaWith({ kind: 'function', depends_on: 'sales_tax_mode' });

		expect(findComputedDependency(schema, 'effective_sales_tax_ids')).toBe('sales_tax_mode');
	});

	// The other kinds are computed from data the server already holds, so no unsaved edit can
	// change them and there is nothing to watch.
	it('ignores non-function computed kinds', () => {
		const schema = schemaWith({ kind: 'aggregate' });

		expect(findComputedDependency(schema, 'effective_sales_tax_ids')).toBeUndefined();
	});

	it('returns undefined for a function field declaring no dependency', () => {
		const schema = schemaWith({ kind: 'function' });

		expect(findComputedDependency(schema, 'effective_sales_tax_ids')).toBeUndefined();
	});

	it('returns undefined for a plain field or a missing schema', () => {
		const schema = schemaWith({ kind: 'function', depends_on: 'sales_tax_mode' });

		expect(findComputedDependency(schema, 'sales_tax_mode')).toBeUndefined();
		expect(findComputedDependency(undefined, 'effective_sales_tax_ids')).toBeUndefined();
	});
});

describe('isFieldFilterable / isFieldSortable', () => {
	it('follows the server flags when present', () => {
		const aggregate = field('variant_count', 'int64', {
			is_computed: true, is_persisted: false, is_filterable: true, is_sortable: true,
		});
		const goOnly = field('display_name', 'string', {
			is_computed: true, is_persisted: false, is_filterable: false, is_sortable: false,
		});
		expect(isFieldFilterable(aggregate)).toBe(true);
		expect(isFieldSortable(aggregate)).toBe(true);
		expect(isFieldFilterable(goOnly)).toBe(false);
		expect(isFieldSortable(goOnly)).toBe(false);
	});

	it('falls back to is_persisted when the server sends no flags', () => {
		expect(isFieldFilterable(field('name', 'string'))).toBe(true);
		expect(isFieldSortable(field('name', 'string', { is_persisted: true }))).toBe(true);
		expect(isFieldFilterable(field('total', 'decimal', { is_persisted: false }))).toBe(false);
		expect(isFieldSortable(field('total', 'decimal', { is_persisted: false }))).toBe(false);
	});
});

describe('buildValidationSchema: decimals', () => {
	const formSchema = schema({
		fields: {
			price: {
				...field('price', 'decimal'),
				data_type: { name: 'decimal', options: { range: [-10, 10] } },
			} as ModelSchemaField,
		},
	});

	// The server's decimal type refuses a JSON number: parsing one goes through a float64.
	it('validates as a number but submits the typed string', () => {
		const parsed = buildValidationSchema(formSchema).safeParse({ price: ' 5.250 ' });

		expect(parsed.success).toBe(true);
		expect(parsed.data).toEqual({ price: '5.250' });
	});

	it('stringifies a number already in the form', () => {
		expect(buildValidationSchema(formSchema).safeParse({ price: 3 }).data).toEqual({ price: '3' });
	});

	it('still refuses junk and out-of-range values', () => {
		expect(buildValidationSchema(formSchema).safeParse({ price: 'abc' }).success).toBe(false);
		expect(buildValidationSchema(formSchema).safeParse({ price: '11' }).success).toBe(false);
	});

	it('leaves a blank optional decimal out', () => {
		expect(buildValidationSchema(formSchema).safeParse({ price: '' }).data).toEqual({});
	});
});
