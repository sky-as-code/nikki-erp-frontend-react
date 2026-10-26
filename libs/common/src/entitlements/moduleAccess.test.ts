import { describe, expect, it } from 'vitest';

import { canAccessModule } from './moduleAccess';

import type { EntitlementContext } from './guard';


function contextWith(entitlements: string[], isOwner = false): EntitlementContext {
	return { entitlements, isOwner, userOrgIds: [] } as EntitlementContext;
}

describe('canAccessModule', () => {
	it('grants every module to the omnipotent expression', () => {
		const context = contextWith(['*:*:*']);
		expect(canAccessModule('iam', context)).toBe(true);
		expect(canAccessModule('vdmc', context)).toBe(true);
	});

	it('grants a module when a resource starts with its prefix', () => {
		const context = contextWith(['read:iam_user:*']);
		expect(canAccessModule('iam', context)).toBe(true);
		expect(canAccessModule('inventory', context)).toBe(false);
	});

	it('matches the model prefix, not the module name', () => {
		expect(canAccessModule('vdmc', contextWith(['update:vdmc_kiosks:org/01ABC']))).toBe(true);
	});

	it('grants a module owning several prefixes when any one matches', () => {
		const prefixes = ['inventory', 'purchase', 'sales'];
		expect(canAccessModule(prefixes, contextWith(['read:sales_order:org']))).toBe(true);
		expect(canAccessModule(prefixes, contextWith(['read:inventory_brand:org']))).toBe(true);
		expect(canAccessModule(prefixes, contextWith(['read:iam_user:org']))).toBe(false);
		expect(canAccessModule([], contextWith(['read:iam_user:org']))).toBe(false);
	});

	it('requires the separator after the prefix', () => {
		expect(canAccessModule('iam', contextWith(['read:iamx_foo:tenant']))).toBe(false);
	});

	it('grants a wildcard resource regardless of action and scope', () => {
		expect(canAccessModule('sales', contextWith(['read:*:org']))).toBe(true);
	});

	it('refuses with no or malformed entitlements', () => {
		expect(canAccessModule('iam', contextWith([]))).toBe(false);
		expect(canAccessModule('iam', contextWith(['iam_user', 'read::org']))).toBe(false);
	});

	it('grants everything to the owner', () => {
		expect(canAccessModule('iam', contextWith([], true))).toBe(true);
	});
});
