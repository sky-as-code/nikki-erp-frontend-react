import { describe, expect, it, vi } from 'vitest';

import { createMenuRegistry } from './MenuRegistry';
import { menuItemsOf } from './ribbon';
import { MenuConflictError, MenuContribution } from './types';


function contribution(slug: string, itemCount = 1): MenuContribution {
	return {
		slug,
		translationNs: 'iam',
		items: Array.from({ length: itemCount }, (_unused, index) => ({ labelKey: `menu.item${index}` })),
	};
}

describe('MenuRegistry', () => {
	it('stores contributions per slug', () => {
		const registry = createMenuRegistry();
		registry.register(contribution('iam'));
		registry.register(contribution('drive'));

		expect(registry.getMenu('iam')?.translationNs).toBe('iam');
		expect(registry.getMenu('drive')?.slug).toBe('drive');
		expect(registry.getMenu('unknown')).toBeUndefined();
		expect(registry.getMenu(null)).toBeUndefined();
	});

	it('does not let one module clobber another', () => {
		const registry = createMenuRegistry();
		registry.register(contribution('iam', 3));
		registry.register(contribution('drive', 1));

		expect(menuItemsOf(registry.getMenu('iam')!)).toHaveLength(3);
	});

	it('throws on duplicate registration without override', () => {
		const registry = createMenuRegistry();
		registry.register(contribution('iam'));

		expect(() => registry.register(contribution('iam'))).toThrow(MenuConflictError);
	});

	it('replaces on override', () => {
		const registry = createMenuRegistry();
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
		registry.register(contribution('iam', 1));
		registry.register(contribution('iam', 4), { override: true });

		expect(menuItemsOf(registry.getMenu('iam')!)).toHaveLength(4);
		expect(warn).toHaveBeenCalled();
		warn.mockRestore();
	});

	it('rejects an empty slug', () => {
		const registry = createMenuRegistry();

		expect(() => registry.register(contribution(''))).toThrow(/non-empty slug/);
	});
});

describe('MenuRegistry subscriptions', () => {
	it('notifies subscribers on register and unregister', () => {
		const registry = createMenuRegistry();
		const listener = vi.fn();
		const unsubscribe = registry.subscribe(listener);

		registry.register(contribution('iam'));
		expect(listener).toHaveBeenCalledTimes(1);

		registry.unregister('iam');
		expect(listener).toHaveBeenCalledTimes(2);
		expect(registry.getMenu('iam')).toBeUndefined();

		unsubscribe();
		registry.register(contribution('drive'));
		expect(listener).toHaveBeenCalledTimes(2);
	});

	it('does not notify when unregistering an unknown slug', () => {
		const registry = createMenuRegistry();
		const listener = vi.fn();
		registry.subscribe(listener);

		registry.unregister('nope');

		expect(listener).not.toHaveBeenCalled();
	});

	it('returns a stable snapshot reference between registrations', () => {
		const registry = createMenuRegistry();
		registry.register(contribution('iam'));

		expect(registry.getMenu('iam')).toBe(registry.getMenu('iam'));
	});

	it('describes what is registered', () => {
		const registry = createMenuRegistry();
		registry.register(contribution('iam', 2));

		expect(registry.describe()).toEqual({
			modules: [{ slug: 'iam', translationNs: 'iam', itemCount: 2 }],
		});
	});

	it('stores a ribbon frozen and describes it by tab count', () => {
		const registry = createMenuRegistry();
		registry.register({
			slug: 'commerce',
			translationNs: 'commerce',
			type: 'ribbon',
			tabs: [{ labelKey: 'a', blocks: [] }, { labelKey: 'b', blocks: [] }],
		});

		expect(Object.isFrozen(registry.getMenu('commerce'))).toBe(true);
		expect(registry.describe().modules[0].itemCount).toBe(2);
	});
});
