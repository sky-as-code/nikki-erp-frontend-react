import { describe, expect, it } from 'vitest';

import {
	BooleanCellRenderer, DateTimeCellRenderer, JsonMapCellRenderer, MoneyFieldRenderer, NumberCellRenderer,
	findDefaultRenderer, getDecimalScale, normalizeBooleanValue,
} from './cellRenderers';

import type * as dyn from '@nikkierp/common/dynamicModel';
import type React from 'react';


const decimalField = {
	name: 'price', data_type: { name: 'decimal', options: { scale: 2 } },
} as unknown as dyn.ModelSchemaField;

describe('findDefaultRenderer', () => {
	it('picks the number renderer for every numeric type and marks it right-aligned', () => {
		for (const name of ['int32', 'int64', 'decimal'] as const) {
			const renderer = findDefaultRenderer(name);
			expect(renderer).toBeInstanceOf(NumberCellRenderer);
			expect(renderer?.align).toBe('right');
		}
	});

	it('picks the date-time renderer for the three temporal types', () => {
		for (const name of ['nikkiDate', 'nikkiTime', 'nikkiDateTime'] as const) {
			expect(findDefaultRenderer(name)).toBeInstanceOf(DateTimeCellRenderer);
		}
	});

	it('leaves plain text without a renderer', () => {
		expect(findDefaultRenderer('string')).toBeUndefined();
		expect(findDefaultRenderer(null)).toBeUndefined();
	});
});

describe('NumberCellRenderer', () => {
	const renderer = new NumberCellRenderer();

	it('passes the decimal scale to LocalizedNumber', () => {
		const node = renderer.render('12.5', '12.5', decimalField) as React.ReactElement<{ fractionDigits?: number }>;
		expect(node.props.fractionDigits).toBe(2);
	});

	it('renders blank for an empty value', () => {
		expect(renderer.render(undefined, '')).toBe('');
	});
});

describe('DateTimeCellRenderer', () => {
	it('tells LocalizedDateTime which parts the field carries', () => {
		const field = { name: 'd', data_type: { name: 'nikkiDate' } } as unknown as dyn.ModelSchemaField;
		const node = new DateTimeCellRenderer().render('2026-09-16', '2026-09-16', field) as
			React.ReactElement<{ kind?: string }>;
		expect(node.props.kind).toBe('date');
	});
});

describe('MoneyFieldRenderer', () => {
	it('is right-aligned and forwards the symbol', () => {
		const renderer = new MoneyFieldRenderer('₫', 0);
		expect(renderer.align).toBe('right');
		const node = renderer.render('1000', '1000') as React.ReactElement<{ currencySymbol: string }>;
		expect(node.props.currencySymbol).toBe('₫');
		expect(renderer.render('', '')).toBe('');
	});
});

describe('BooleanCellRenderer', () => {
	it('renders a read-only switch reflecting the value', () => {
		const node = new BooleanCellRenderer().render('yes', 'yes') as React.ReactElement<{ checked: boolean, readOnly: boolean }>;
		expect(node.props.checked).toBe(true);
		expect(node.props.readOnly).toBe(true);
	});

	it('normalizes the usual truthy spellings', () => {
		expect(normalizeBooleanValue(true)).toBe(true);
		expect(normalizeBooleanValue(1)).toBe(true);
		expect(normalizeBooleanValue('TRUE')).toBe(true);
		expect(normalizeBooleanValue('no')).toBe(false);
		expect(normalizeBooleanValue(null)).toBe(false);
	});
});

describe('getDecimalScale', () => {
	it('reads the scale option and ignores fields without one', () => {
		expect(getDecimalScale(decimalField)).toBe(2);
		expect(getDecimalScale({ name: 'n', data_type: 'string' } as unknown as dyn.ModelSchemaField)).toBeUndefined();
		expect(getDecimalScale(undefined)).toBeUndefined();
	});
});

describe('JsonMapCellRenderer', () => {
	const renderer = new JsonMapCellRenderer();

	it('matches only the jsonmap data type', () => {
		expect(renderer.matches('jsonmap')).toBe(true);
		expect(renderer.matches('string')).toBe(false);
		expect(renderer.matches(null)).toBe(false);
	});

	it('stringifies an object value', () => {
		const node = renderer.render({ a: 1, b: 'two' }, '') as React.ReactElement<{ children: string }>;
		expect(node.props.children).toBe('{"a":1,"b":"two"}');
	});

	it('renders an empty string for a null or undefined value', () => {
		expect(renderer.render(null, '')).toBe('');
		expect(renderer.render(undefined, '')).toBe('');
	});
});
