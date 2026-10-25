import { describe, expect, it } from 'vitest';

import { buildValidationSchema } from './model_schema';

import type { ModelSchema, ModelSchemaField } from './model_schema';


function nameSchema(extra: Partial<ModelSchemaField> = {}, options?: Record<string, unknown>): ModelSchema {
	return {
		name: 'inventory_attribute',
		fields: {
			name: {
				name: 'name', label: { 'en-US': 'Name' }, data_type: { name: 'nikkiLangJson', options }, ...extra,
			} as ModelSchemaField,
		},
	};
}

function issuesOf(modelSchema: ModelSchema, value: unknown) {
	const parsed = buildValidationSchema(modelSchema).safeParse({ name: value });
	return parsed.success ? [] : parsed.error.issues.map(issue => ({ path: issue.path, message: issue.message }));
}

describe('buildValidationSchema: LangJSON required', () => {
	const required = nameSchema({ is_required_for_create: true });

	it('refuses an empty object and all-blank translations', () => {
		expect(issuesOf(required, {})).toEqual([{ path: ['name'], message: 'err_missing_required_field' }]);
		expect(issuesOf(required, { 'en-US': ' ', 'vi-VN': '' }))
			.toEqual([{ path: ['name'], message: 'err_missing_required_field' }]);
	});

	it('accepts one translation, or a `$ref` alone', () => {
		expect(issuesOf(required, { 'en-US': '', 'vi-VN': 'Xanh' })).toEqual([]);
		expect(issuesOf(required, { $ref: 'attr.color' })).toEqual([]);
	});

	it('lets an optional LangJSON stay empty', () => {
		expect(issuesOf(nameSchema(), {})).toEqual([]);
		expect(issuesOf(nameSchema(), undefined)).toEqual([]);
	});
});

describe('buildValidationSchema: LangJSON per-translation rules', () => {
	const ruled = nameSchema({}, { length: [2, 5], pattern: '^[A-Za-z ]*$' });

	it('marks the field invalid with one error when any translation is too long', () => {
		expect(issuesOf(ruled, { 'en-US': 'Blue', 'vi-VN': 'Xanh nuoc bien' }))
			.toEqual([{ path: ['name'], message: 'err_invalid_string_length' }]);
	});

	it('applies the pattern to every translation', () => {
		expect(issuesOf(ruled, { 'en-US': 'Blue', 'vi-VN': 'Xa1' }))
			.toEqual([{ path: ['name'], message: 'err_invalid_string_pattern' }]);
	});

	it('skips blank translations and `$ref`, and ignores a pattern JavaScript cannot compile', () => {
		expect(issuesOf(ruled, { 'en-US': 'Blue', 'vi-VN': '', $ref: 'a.very.long.key' })).toEqual([]);
		expect(issuesOf(nameSchema({}, { pattern: '(?P<x>a)' }), { 'en-US': 'b' })).toEqual([]);
	});

	it('refuses a value that is not a map of strings', () => {
		expect(issuesOf(nameSchema(), { 'en-US': 3 })).not.toEqual([]);
	});
});
