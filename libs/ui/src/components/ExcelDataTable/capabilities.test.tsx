import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { findCapabilityConfigErrors, resolveCapabilities, useCapabilityLocks, withLeadingField } from './capabilities';
import { EntitlementProvider } from '../PermissionGuard/entitlementContext';

import type { CapabilityEntitlements, CapabilityLocks } from './capabilities';
import type { EntitlementSource } from '../PermissionGuard/entitlementContext';


describe('resolveCapabilities', () => {
	it('is read-only without capabilities or an update command', () => {
		expect(resolveCapabilities({})).toEqual([]);
	});

	it('keeps the legacy inline update of a table given only an update command', () => {
		expect(resolveCapabilities({ updateCommand: 'products.update' })).toEqual(['update']);
	});

	it('lets declared capabilities win over the legacy update command', () => {
		expect(resolveCapabilities({ capabilities: ['delete'], updateCommand: 'products.update' })).toEqual(['delete']);
		expect(resolveCapabilities({ capabilities: [], updateCommand: 'products.update' })).toEqual([]);
	});

	it('orders and de-duplicates the declared capabilities', () => {
		expect(resolveCapabilities({ capabilities: ['delete', 'create', 'delete'] })).toEqual(['create', 'delete']);
	});
});

describe('findCapabilityConfigErrors', () => {
	it('accepts a command or a callback as the sink of each capability', () => {
		expect(findCapabilityConfigErrors({
			capabilities: ['create', 'update', 'delete'],
			createCommand: 'roles.create',
			onUpdated: () => undefined,
			deleteCommand: 'roles.delete',
		})).toEqual([]);
	});

	it('reports a capability with neither a command nor a callback', () => {
		const errors = findCapabilityConfigErrors({ capabilities: ['create', 'delete'], onDeleted: () => undefined });
		expect(errors).toEqual(['capability \'create\' needs either createCommand or onCreated']);
	});

	it('reports a server-resource insert row missing its schema or search field', () => {
		const errors = findCapabilityConfigErrors({
			capabilities: ['create'], onCreated: () => undefined, newRowSource: 'server-resource',
		});
		expect(errors).toHaveLength(2);
		expect(errors[0]).toContain('newRowResourceSchema');
		expect(errors[1]).toContain('newRowSearchField');
	});

	it('accepts a complete server-resource configuration', () => {
		expect(findCapabilityConfigErrors({
			capabilities: ['create'],
			createCommand: 'roles.manageUsers',
			newRowSource: 'server-resource',
			newRowResourceSchema: 'iam_user',
			newRowSearchField: 'id',
		})).toEqual([]);
	});
});

describe('withLeadingField', () => {
	it('moves the field first, keeping the others in order', () => {
		expect(withLeadingField(['name', 'id', 'email'], 'id')).toEqual(['id', 'name', 'email']);
	});

	it('adds a field the list does not have', () => {
		expect(withLeadingField(['name'], 'id')).toEqual(['id', 'name']);
	});

	it('returns the list unchanged without a field', () => {
		const fields = ['name'];
		expect(withLeadingField(fields, undefined)).toBe(fields);
	});
});

const manage = 'manage_entitlements:iam_role:tenant';

function LocksProbe({ entitlements }: { entitlements: CapabilityEntitlements }) {
	return <>{JSON.stringify(useCapabilityLocks(entitlements))}</>;
}

function renderLocks(source: EntitlementSource | null, entitlements: CapabilityEntitlements): CapabilityLocks {
	const probe = <LocksProbe entitlements={entitlements} />;
	const tree = source ? <EntitlementProvider value={source}>{probe}</EntitlementProvider> : probe;
	const html = renderToStaticMarkup(tree);
	return JSON.parse(html.replace(/&quot;/g, '"')) as CapabilityLocks;
}

describe('useCapabilityLocks', () => {
	it('locks a capability whose entitlement the caller lacks, naming it', () => {
		const locks = renderLocks(
			{ context: { entitlements: [], userOrgIds: [] } },
			{ create: manage, delete: manage },
		);
		expect(locks.create).toEqual({ locked: true, missing: [manage] });
		expect(locks.delete.locked).toBe(true);
		expect(locks.update.locked).toBe(false);
	});

	it('leaves a held entitlement unlocked', () => {
		const locks = renderLocks({ context: { entitlements: [manage], userOrgIds: [] } }, { create: manage });
		expect(locks.create.locked).toBe(false);
	});

	it('never locks while the entitlement context is still loading', () => {
		const locks = renderLocks(null, { create: manage, update: manage, delete: manage });
		expect([locks.create.locked, locks.update.locked, locks.delete.locked]).toEqual([false, false, false]);
	});
});
