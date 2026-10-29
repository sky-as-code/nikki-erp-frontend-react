import { describe, expect, it } from 'vitest';

import { localizeFieldDescription } from './localizeFieldDescription';


const dictionary: Record<string, string> = { 'field_desc.x.kind': 'Kind of x\n* a: first' };
const localize = (langJson: unknown): string => {
	if (!langJson) return '';
	if (typeof langJson === 'string') return dictionary[langJson] ?? langJson;
	const ref = (langJson as Record<string, string>).$ref;
	return ref ? dictionary[ref] ?? ref : (langJson as Record<string, string>)['en-US'] ?? '';
};

describe('localizeFieldDescription', () => {
	it('resolves a $ref description, keeping its lines', () => {
		expect(localizeFieldDescription(localize, { $ref: 'field_desc.x.kind' })).toBe('Kind of x\n* a: first');
	});

	it('reads an untranslated $ref as no description', () => {
		expect(localizeFieldDescription(localize, { $ref: 'field_desc.x.missing' })).toBe('');
	});

	it('gives nothing without a description or a localizer', () => {
		expect(localizeFieldDescription(localize, undefined)).toBe('');
		expect(localizeFieldDescription(null, { $ref: 'field_desc.x.kind' })).toBe('');
		expect(localizeFieldDescription(localize, { 'en-US': '  ' })).toBe('');
	});
});
