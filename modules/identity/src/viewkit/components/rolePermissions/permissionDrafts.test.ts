import { ClientErrorItem } from '@nikkierp/common/types';
import { describe, expect, it } from 'vitest';

import {
	ALL_ACTIONS_VALUE, buildEntitlementsContribution, draftsFor, emptyDrafts, entitlementErrors, grantDraft,
	resolveName, revokeRow, toActionOptions, toPermissionRows, toResourceOptions,
} from './permissionDrafts';

import type { DraftGrant, PermissionDrafts } from './permissionDrafts';
import type { PermissionName, RoleEntitlement } from '../../../features/role/rolePermissions';


const ROLE = 'role-1';

const existing: RoleEntitlement[] = [
	{
		id: 'ent-user-all', resource_id: 'res-user', action_id: null, description: 'All IAM power',
		resource: { code: 'iam_user', name: { 'en-US': 'IAM User' } }, action: null,
	},
	{
		id: 'ent-product-read', resource_id: 'res-product', action_id: 'act-read', description: null,
		resource: { code: 'inventory_product', name: { 'en-US': 'Inventory Product' } },
		action: { code: 'read', name: { 'en-US': 'Read' } },
	},
];

function nameOf(name: PermissionName): string {
	return resolveName(name, langJson => langJson['en-US'] ?? '$missing.translation');
}

const labels = { nameOf, allLabel: 'All' };

function draft(resourceId: string, actionId: string | null, overrides: Partial<DraftGrant> = {}): DraftGrant {
	return {
		resourceId, actionId, resourceName: { 'en-US': resourceId }, actionName: actionId ? { 'en-US': actionId } : null,
		description: '', ...overrides,
	};
}

describe('grantDraft', () => {
	it('adds a new grant as a draft', () => {
		const result = grantDraft(emptyDrafts(ROLE), draft('res-group', 'act-read'), existing);
		expect(result.outcome).toBe('added');
		expect(result.drafts.added).toHaveLength(1);
	});

	it('blocks a grant the role already holds, including the All grant', () => {
		const start = emptyDrafts(ROLE);
		expect(grantDraft(start, draft('res-user', null), existing)).toEqual({ drafts: start, outcome: 'duplicate' });
		expect(grantDraft(start, draft('res-product', 'act-read'), existing).outcome).toBe('duplicate');
	});

	it('blocks a grant that is already drafted', () => {
		const once = grantDraft(emptyDrafts(ROLE), draft('res-group', null), existing).drafts;
		const twice = grantDraft(once, draft('res-group', null, { description: 'again' }), existing);
		expect(twice.outcome).toBe('duplicate');
		expect(twice.drafts.added).toHaveLength(1);
	});

	it('treats All and a specific action on the same resource as different grants', () => {
		expect(grantDraft(emptyDrafts(ROLE), draft('res-user', 'act-read'), existing).outcome).toBe('added');
	});

	it('restores a saved entitlement marked for removal instead of drafting it again', () => {
		const removed: PermissionDrafts = { ...emptyDrafts(ROLE), removed: ['ent-user-all'] };
		const result = grantDraft(removed, draft('res-user', null), existing);
		expect(result.outcome).toBe('restored');
		expect(result.drafts).toEqual(emptyDrafts(ROLE));
	});
});

describe('revokeRow', () => {
	it('drops a draft row', () => {
		const drafts = grantDraft(emptyDrafts(ROLE), draft('res-group', null), existing).drafts;
		expect(revokeRow(drafts, { key: 'res-group:*', state: 'draft' })).toEqual(emptyDrafts(ROLE));
	});

	it('marks a saved row removed, and a second revoke undoes it', () => {
		const marked = revokeRow(emptyDrafts(ROLE), { key: 'ent-product-read', state: 'existing' });
		expect(marked.removed).toEqual(['ent-product-read']);
		expect(revokeRow(marked, { key: 'ent-product-read', state: 'removed' }).removed).toEqual([]);
	});
});

describe('draftsFor', () => {
	it('does not carry drafts over to another role', () => {
		const drafts = grantDraft(emptyDrafts(ROLE), draft('res-group', null), existing).drafts;
		expect(draftsFor(drafts, ROLE)).toBe(drafts);
		expect(draftsFor(drafts, 'role-2')).toEqual(emptyDrafts('role-2'));
	});
});

describe('toPermissionRows', () => {
	it('sorts by resource label, All first, then action label, with drafts in place', () => {
		let drafts = grantDraft(emptyDrafts(ROLE), draft('res-user', 'act-write', {
			resourceName: { 'en-US': 'IAM User' }, actionName: { 'en-US': 'Write' },
		}), existing).drafts;
		drafts = grantDraft(drafts, draft('res-account', null, { resourceName: { 'en-US': 'Accounting Tax' } }), existing)
			.drafts;
		drafts = revokeRow(drafts, { key: 'ent-product-read', state: 'existing' });
		const rows = toPermissionRows(existing, drafts, labels);
		expect(rows.map(row => [row.resourceLabel, row.actionLabel, row.state])).toEqual([
			['Accounting Tax', 'All', 'draft'],
			['IAM User', 'All', 'existing'],
			['IAM User', 'Write', 'draft'],
			['Inventory Product', 'Read', 'removed'],
		]);
		expect(rows[0].key).toBe('res-account:*');
	});

	it('falls back to the code when a name has no label', () => {
		const rows = toPermissionRows([{ id: 'ent', resource_id: 'res', action_id: 'act',
			resource: { code: 'iam_org', name: null }, action: { code: 'read', name: '' } }], emptyDrafts(ROLE), labels);
		expect(rows[0]).toMatchObject({ resourceLabel: 'iam_org', actionLabel: 'read' });
	});
});

describe('buildEntitlementsContribution', () => {
	it('sends nothing without drafts', () => {
		expect(buildEntitlementsContribution(emptyDrafts(ROLE))).toBeUndefined();
	});

	it('maps drafts to the update delta, trimming and omitting an empty description', () => {
		let drafts = grantDraft(emptyDrafts(ROLE), draft('res-group', null, { description: '  Read all  ' }), existing)
			.drafts;
		drafts = grantDraft(drafts, draft('res-org', 'act-read', { description: '   ' }), existing).drafts;
		drafts = revokeRow(drafts, { key: 'ent-user-all', state: 'existing' });
		expect(buildEntitlementsContribution(drafts)).toEqual({
			entitlements: {
				add: [
					{ resource_id: 'res-group', action_id: null, description: 'Read all' },
					{ resource_id: 'res-org', action_id: 'act-read' },
				],
				remove: ['ent-user-all'],
			},
		});
	});
});

describe('options', () => {
	it('sorts resources by label', () => {
		const options = toResourceOptions([
			{ id: 'b', name: { 'en-US': 'Sales Order' } },
			{ id: 'a', name: { 'en-US': 'accounting Tax' } },
			{ id: 'c', code: 'zz_code' },
		], nameOf);
		expect(options.map(option => option.value)).toEqual(['a', 'b', 'c']);
	});

	it('puts All before the sorted actions', () => {
		const options = toActionOptions([
			{ id: 'w', name: { 'en-US': 'Write' } },
			{ id: 'r', name: { 'en-US': 'Read' } },
		], nameOf, 'All');
		expect(options).toEqual([
			{ value: ALL_ACTIONS_VALUE, label: 'All' }, { value: 'r', label: 'Read' }, { value: 'w', label: 'Write' },
		]);
	});
});

describe('resolveName', () => {
	it('keeps a plain string and falls back to any language when the current one is missing', () => {
		expect(nameOf('Legacy name')).toBe('Legacy name');
		expect(nameOf({ 'vi-VN': 'Vai trò' })).toBe('Vai trò');
	});
});

/** What `useLocalize` does with a plain `langjson` (no `$ref`): the active language, else a marker. */
function viNameOf(name: PermissionName): string {
	return resolveName(name, langJson => langJson['vi-VN'] ?? '$missing.translation');
}

function bilingual(enUs: string, viVn: string): PermissionName {
	return { 'en-US': enUs, 'vi-VN': viVn };
}

describe('localized labels from langjson names', () => {
	it('labels saved rows from the projected resource.name / action.name edges, not their codes', () => {
		const projected: RoleEntitlement[] = [{
			id: 'ent-1', resource_id: 'res-orgunit', action_id: 'act-manage',
			resource: { id: 'res-orgunit', code: 'iam_orgunit', name: bilingual('Org Unit', 'Đơn vị tổ chức') },
			action: { id: 'act-manage', code: 'manage_users', name: bilingual('Manage users', 'Quản lý người dùng') },
		}, {
			id: 'ent-2', resource_id: 'res-group', action_id: 'act-read',
			resource: { id: 'res-group', code: 'iam_group', name: bilingual('Group', 'Nhóm') },
			action: { id: 'act-read', code: 'read', name: bilingual('Read', 'Xem') },
		}];
		const rows = toPermissionRows(projected, emptyDrafts(ROLE), { nameOf: viNameOf, allLabel: 'Tất cả' });
		expect(rows.map(row => [row.resourceLabel, row.actionLabel])).toEqual([
			['Đơn vị tổ chức', 'Quản lý người dùng'],
			['Nhóm', 'Xem'],
		]);
	});

	it('labels a drafted grant from the langjson name of the picked option', () => {
		const grant = draft('res-group', 'act-read', {
			resourceName: bilingual('Group', 'Nhóm'), actionName: bilingual('Read', 'Xem'),
		});
		const drafts = grantDraft(emptyDrafts(ROLE), grant, []).drafts;
		const [row] = toPermissionRows([], drafts, { nameOf: viNameOf, allLabel: 'Tất cả' });
		expect(row).toMatchObject({ resourceLabel: 'Nhóm', actionLabel: 'Xem', state: 'draft' });
	});

	it('labels and sorts both pickers by the localized name', () => {
		const resources = toResourceOptions([
			{ id: 'res-group', code: 'iam_group', name: bilingual('Group', 'Nhóm') },
			{ id: 'res-orgunit', code: 'iam_orgunit', name: bilingual('Org Unit', 'Đơn vị tổ chức') },
			{ id: 'res-user', code: 'iam_user', name: bilingual('User', 'Người dùng') },
		], viNameOf);
		expect(resources.map(option => option.label)).toEqual(['Đơn vị tổ chức', 'Người dùng', 'Nhóm']);
		const actions = toActionOptions([
			{ id: 'act-read', code: 'read', name: bilingual('Read', 'Xem') },
			{ id: 'act-manage', code: 'manage_users', name: bilingual('Manage users', 'Quản lý người dùng') },
		], viNameOf, 'Tất cả');
		expect(actions.map(option => option.label)).toEqual(['Tất cả', 'Quản lý người dùng', 'Xem']);
	});

	it('falls back to the code only when the name is missing', () => {
		const options = toResourceOptions([
			{ id: 'res-a', code: 'iam_a' },
			{ id: 'res-b', code: 'iam_b', name: bilingual('B', 'Bê') },
		], viNameOf);
		expect(options.map(option => option.label)).toEqual(['Bê', 'iam_a']);
	});
});

describe('entitlementErrors', () => {
	it('keeps only the rejections addressed to the delta', () => {
		const errors = [
			new ClientErrorItem({ key: 'iam:err_too_many_items', message: 'too many', type: 'validation', field: 'entitlements.add' }),
			new ClientErrorItem({ key: 'iam:err_x', message: 'x', type: 'business', field: 'entitlements.remove[0]' }),
			new ClientErrorItem({ key: 'common:err_y', message: 'y', type: 'validation', field: 'name' }),
		];
		expect(entitlementErrors(errors).map(item => item.key)).toEqual(['iam:err_too_many_items', 'iam:err_x']);
	});
});
