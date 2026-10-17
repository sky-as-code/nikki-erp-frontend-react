import { describe, expect, it } from 'vitest';

import { getActionStateProps, isActionVisible } from './Action';


describe('isActionVisible', () => {
	// Selecting rows swaps the bar rather than adding to it: Refresh and Create have nothing to do
	// with a pending selection, so they step aside for the actions that act on it.
	it('shows a table-level action only while nothing is selected', () => {
		expect(isActionVisible(undefined, 0)).toBe(true);
		expect(isActionVisible(undefined, 1)).toBe(false);
		expect(isActionVisible(undefined, 3)).toBe(false);
	});

	it('shows a single-selection action for exactly one row', () => {
		expect(isActionVisible('single', 0)).toBe(false);
		expect(isActionVisible('single', 1)).toBe(true);
		expect(isActionVisible('single', 2)).toBe(false);
	});

	it('shows a multiple-selection action for one or more rows', () => {
		expect(isActionVisible('multiple', 0)).toBe(false);
		expect(isActionVisible('multiple', 1)).toBe(true);
		expect(isActionVisible('multiple', 5)).toBe(true);
	});
});

describe('getActionStateProps', () => {
	it('keeps the icon and stays enabled when idle', () => {
		const props = getActionStateProps({ icon: 'icon' });
		expect(props.leftSection).toBe('icon');
		expect(props.disabled).toBe(false);
		expect(props).not.toHaveProperty('c');
	});

	it('swaps the icon for a spinner and disables the control while loading', () => {
		const props = getActionStateProps({ icon: 'icon', loading: true });
		expect(props.leftSection).not.toBe('icon');
		expect(props.disabled).toBe(true);
		expect(props['aria-busy']).toBe(true);
	});

	it('greys a dimmed action without disabling it, so the click still answers', () => {
		const props = getActionStateProps({ dimmed: true });
		expect(props.disabled).toBe(false);
		expect(props).toMatchObject({ color: 'gray', c: 'dimmed', 'data-dimmed': 'true' });
	});
});
