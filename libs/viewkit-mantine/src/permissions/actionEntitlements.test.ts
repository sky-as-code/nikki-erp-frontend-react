import { ResourceScope } from '@nikkierp/common/entitlements';
import { describe, expect, it } from 'vitest';

import { actionRequirement, commandActionCode, resolveActionCode } from './actionEntitlements';


describe('actionRequirement', () => {
	it('defaults to org scope', () => {
		expect(actionRequirement('inventory_brand', 'create')).toEqual({
			action: 'create', resource: 'inventory_brand', scope: ResourceScope.Org,
		});
	});

	it('takes an explicit scope for resources the backend asserts tenant-wide', () => {
		expect(actionRequirement('settings_record', 'update', ResourceScope.Tenant).scope)
			.toBe(ResourceScope.Tenant);
	});
});

describe('commandActionCode', () => {
	it.each([
		['core.resource.inventory_brand.create', 'create'],
		['core.resource.inventory_brand.delete', 'delete'],
		['iam.iam_user.suspend_user', 'update'],
		['core.resource.inventory_brand.set_archived', 'set_archived'],
	])('derives %s as %s', (command, code) => {
		expect(commandActionCode(command)).toBe(code);
	});

	it('returns null for a verb it cannot map', () => {
		expect(commandActionCode('inventory.inventory_stock_transfer.confirm')).toBeNull();
		expect(commandActionCode(undefined)).toBeNull();
	});
});

describe('resolveActionCode', () => {
	it('takes the explicit code first, then the derived one', () => {
		expect(resolveActionCode({ command: 'x.y.create_return', actionCode: 'create_return' })).toBe('create_return');
		expect(resolveActionCode({ command: 'core.resource.s.delete' })).toBe('delete');
		expect(resolveActionCode({})).toBeNull();
	});
});
