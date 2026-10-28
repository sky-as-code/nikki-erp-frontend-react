import { describe, expect, it } from 'vitest';

import { capitalizeFirst, formatEdgeValue, historyEdgeNames, historyFieldLabel, qualifyLangJson } from './historyLabels';

import type * as dyn from '@nikkierp/common/dynamicModel';


const schema = {
	name: 'iam_user',
	fields: {
		roles: { name: 'roles', label: { $ref: 'fields.roles' } },
		email: { name: 'email', label: { $ref: 'fields.email' } },
	},
	to_relations: [{ edge: 'roles', dest_schema_name: 'iam_role', relation_type: 'many:many' }],
} as unknown as dyn.ModelSchema;
const related = { iam_role: { name: 'iam_role', label: { $ref: 'iam_role.label' } } } as unknown as
	Record<string, dyn.ModelSchema>;
const texts: Record<string, string> = {
	'iam:fields.email': 'Email', 'iam:iam_role.label#99': 'roles', 'iam:iam_role.label#1': 'role',
};
const localize = (label: unknown, opts?: { count: number }) => {
	const ref = (label as Record<string, string> | undefined)?.$ref ?? '';
	const key = ref.includes(':') ? ref : `iam:${ref}`;
	return texts[opts ? `${key}#${opts.count}` : key] ?? key;
};

function labelOf(field: string): string {
	return historyFieldLabel({
		field, schema, localize, localizeAny: localize, relatedSchemas: related, moduleOf: () => 'iam',
	});
}

describe('historyFieldLabel', () => {
	it('keeps a translated field label', () => {
		expect(labelOf('email')).toBe('Email');
	});

	it('names an untranslated many-to-many edge after its peer, plural and capitalized', () => {
		expect(labelOf('roles')).toBe('Roles');
	});

	it('falls back to the field name', () => {
		expect(labelOf('unknown')).toBe('unknown');
	});
});

describe('formatEdgeValue', () => {
	it('joins labels, keeps an unlabelled id and shows - for nothing', () => {
		expect(formatEdgeValue(['A', 'B'], { A: 'Role A' })).toBe('Role A, B');
		expect(formatEdgeValue('U1', { U1: 'Ann' })).toBe('Ann');
		expect(formatEdgeValue([], undefined)).toBe('-');
		expect(formatEdgeValue(null, undefined)).toBe('-');
	});
});

describe('helpers', () => {
	it('lists the edges a change set names, once each', () => {
		expect(historyEdgeNames(schema, [
			{ field: 'roles', old: null, new: [] }, { field: 'roles', old: null, new: [] }, { field: 'email', old: 'a', new: 'b' },
		])).toEqual(['roles']);
	});

	it('qualifies a label reference with its module and capitalizes', () => {
		expect(qualifyLangJson({ $ref: 'iam_role.label' }, 'iam')).toEqual({ $ref: 'iam:iam_role.label' });
		expect(qualifyLangJson({ $ref: 'iam:iam_role.label' }, 'iam')).toEqual({ $ref: 'iam:iam_role.label' });
		expect(capitalizeFirst('user created')).toBe('User created');
	});
});
