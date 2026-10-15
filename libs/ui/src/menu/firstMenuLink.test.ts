import { describe, expect, it } from 'vitest';

import { findFirstMenuLink } from './firstMenuLink';


describe('findFirstMenuLink', () => {
	it('returns a leading leaf link', () => {
		expect(findFirstMenuLink([
			{ labelKey: 'overview', link: '/overview' },
			{ labelKey: 'group', items: [{ labelKey: 'a', link: '/a' }] },
		])).toBe('/overview');
	});

	it('returns the first sub-item when the first main item is a group', () => {
		expect(findFirstMenuLink([
			{ labelKey: 'tax', items: [{ labelKey: 'taxes', link: '/accounting_tax' }, { labelKey: 'b', link: '/b' }] },
		])).toBe('/accounting_tax');
	});

	it('walks into nested groups', () => {
		expect(findFirstMenuLink([
			{ labelKey: 'l1', items: [{ labelKey: 'l2', items: [{ labelKey: 'l3', link: '/deep' }] }] },
		])).toBe('/deep');
	});

	it('skips an empty group', () => {
		expect(findFirstMenuLink([
			{ labelKey: 'empty', items: [] },
			{ labelKey: 'next', link: '/next' },
		])).toBe('/next');
	});

	it('returns null when nothing links', () => {
		expect(findFirstMenuLink([])).toBeNull();
		expect(findFirstMenuLink([{ labelKey: 'group', items: [{ labelKey: 'leaf' }] }])).toBeNull();
	});
});
