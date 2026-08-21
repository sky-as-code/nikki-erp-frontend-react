import { describe, expect, it } from 'vitest';

import { JsonMapCellRenderer } from './cellRenderers';

import type React from 'react';


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

	it('stringifies an array value', () => {
		const node = renderer.render([1, 2, 3], '') as React.ReactElement<{ children: string }>;
		expect(node.props.children).toBe('[1,2,3]');
	});

	it('renders an empty string for a null or undefined value', () => {
		expect(renderer.render(null, '')).toBe('');
		expect(renderer.render(undefined, '')).toBe('');
	});
});
