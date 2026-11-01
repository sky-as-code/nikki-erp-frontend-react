import { describe, expect, it } from 'vitest';

import { autoInputWidthOf } from './inputWidth';

import type * as dyn from '@nikkierp/common/dynamicModel';


const fieldOf = (name: string, options?: Record<string, unknown>, isArray = false) => ({
	name: 'x', label: {}, data_type: { name, options, is_array: isArray },
}) as unknown as dyn.ModelSchemaField;

describe('autoInputWidthOf', () => {
	it('keeps numbers short', () => {
		expect(autoInputWidthOf(fieldOf('int32'))).toBe('10rem');
		expect(autoInputWidthOf(fieldOf('decimal', { scale: 6 }))).toBe('11rem');
	});

	it('sizes a string by its maximum length, and lets long text fill its track', () => {
		expect(autoInputWidthOf(fieldOf('string', { length: [3, 3] }))).toBe('8rem');
		expect(autoInputWidthOf(fieldOf('string', { length: [0, 50] }))).toBe('16rem');
		expect(autoInputWidthOf(fieldOf('string', { length: [1, 200] }))).toBeUndefined();
		expect(autoInputWidthOf(fieldOf('string'))).toBeUndefined();
	});

	it('leaves self-sizing types and arrays alone', () => {
		expect(autoInputWidthOf(fieldOf('enumString'))).toBeUndefined();
		expect(autoInputWidthOf(fieldOf('ulid'))).toBeUndefined();
		expect(autoInputWidthOf(fieldOf('int32', undefined, true))).toBeUndefined();
		expect(autoInputWidthOf(undefined)).toBeUndefined();
	});
});
