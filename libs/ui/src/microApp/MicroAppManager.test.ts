import { describe, expect, it } from 'vitest';

import { MicroAppManager } from './MicroAppManager';

import type { RegisterReducerFn } from './MicroAppStateProvider';
import type { MicroAppMetadata } from './types';


function app(slug: string, schemaPrefix?: string): MicroAppMetadata {
	return { slug, basePath: slug, bundleUrl: () => Promise.resolve({}), htmlTag: `tag-${slug}`, schemaPrefix } as MicroAppMetadata;
}

function managerOf(...apps: MicroAppMetadata[]): MicroAppManager {
	return new MicroAppManager(apps, {
		registerReducerFactory: () => (() => {}) as unknown as RegisterReducerFn,
	});
}

describe('MicroAppManager.findOwnerSlug', () => {
	it('matches a prefix that equals the slug', () => {
		const manager = managerOf(app('essential'), app('inventory'));

		expect(manager.findOwnerSlug('essential_uom')).toBe('essential');
	});

	it('prefers a declared schemaPrefix over the slug', () => {
		const manager = managerOf(app('vendingmachine', 'vdmc'));

		expect(manager.findOwnerSlug('vdmc_kiosks')).toBe('vendingmachine');
		// The slug itself is not a schema prefix once one is declared.
		expect(manager.findOwnerSlug('vendingmachine_kiosks')).toBeUndefined();
	});

	// Module names carry no underscore, so only the first segment is ever the prefix.
	it('resolves a multi-underscore name on its first segment', () => {
		const manager = managerOf(app('inventory'), app('vendingmachine', 'vdmc'));

		expect(manager.findOwnerSlug('inventory_product_template')).toBe('inventory');
		expect(manager.findOwnerSlug('vdmc_kiosk_events')).toBe('vendingmachine');
	});

	it('returns undefined for an unregistered prefix', () => {
		const manager = managerOf(app('inventory'));

		expect(manager.findOwnerSlug('essential_uom')).toBeUndefined();
	});

	it('returns undefined for a name with no prefix separator', () => {
		const manager = managerOf(app('inventory'));

		expect(manager.findOwnerSlug('inventory')).toBeUndefined();
		expect(manager.findOwnerSlug('_leading')).toBeUndefined();
	});
});
