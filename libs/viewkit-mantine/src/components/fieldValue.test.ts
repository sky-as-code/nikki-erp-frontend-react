import { MoneyFieldRenderer } from '@nikkierp/ui/components/ExcelDataTable';
import { describe, expect, it } from 'vitest';

import { formatFieldValue, renderDisplayFieldValue } from './fieldValue';

import type * as dyn from '@nikkierp/common/dynamicModel';
import type React from 'react';


function field(name: string, typeName: string, options?: Record<string, unknown>): dyn.ModelSchemaField {
	return { name, data_type: { name: typeName, options } } as unknown as dyn.ModelSchemaField;
}

describe('renderDisplayFieldValue', () => {
	it('formats numbers through LocalizedNumber with the decimal scale', () => {
		const node = renderDisplayFieldValue('12.5', field('price', 'decimal', { scale: 2 })) as
			React.ReactElement<{ value: string, fractionDigits?: number }>;
		expect(node.props.value).toBe('12.5');
		expect(node.props.fractionDigits).toBe(2);
	});

	it('formats dates and times through LocalizedDateTime with the matching kind', () => {
		const date = renderDisplayFieldValue('2026-09-16', field('d', 'nikkiDate')) as React.ReactElement<{ kind: string }>;
		const time = renderDisplayFieldValue('08:05', field('t', 'nikkiTime')) as React.ReactElement<{ kind: string }>;
		expect(date.props.kind).toBe('date');
		expect(time.props.kind).toBe('time');
	});

	it('keeps the dash for unset values and plain text for strings', () => {
		expect(renderDisplayFieldValue(null, field('n', 'decimal'))).toBe('-');
		expect(renderDisplayFieldValue('', field('d', 'nikkiDate'))).toBe('-');
		expect(renderDisplayFieldValue('abc', field('s', 'string'))).toBe('abc');
	});

	it('lets a page-declared renderer win over the data-type default', () => {
		const node = renderDisplayFieldValue('1000', field('total', 'decimal'), undefined, new MoneyFieldRenderer('₫', 0)) as
			React.ReactElement<{ currencySymbol: string }>;
		expect(node.props.currencySymbol).toBe('₫');
	});

	it('translates an enum through its `{field}.{value}` key and falls back to the stored value', () => {
		const translated = renderDisplayFieldValue('vn', field('country', 'enumString'), () => 'Vietnam');
		const missing = renderDisplayFieldValue('vn', field('country', 'enumString'), () => 'iam:country.vn');
		expect(translated).toBe('Vietnam');
		expect(missing).toBe('vn');
	});
});

describe('formatFieldValue', () => {
	it('stringifies scalars and objects, dashes the unset', () => {
		expect(formatFieldValue(true)).toBe('true');
		expect(formatFieldValue({ a: 1 })).toBe('{"a":1}');
		expect(formatFieldValue(undefined)).toBe('-');
	});
});
