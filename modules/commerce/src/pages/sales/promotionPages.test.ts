import { describe, expect, it } from 'vitest';

import { buildSalesPromotionPages } from './salesPromotion';
import { buildSalesPromotionRewardPages } from './salesPromotionReward';
import { buildSalesPromotionRulePages } from './salesPromotionRule';
import { buildSalesVoucherPages } from './salesVoucher';
import * as c from '../../constants/sales';
import { buildSalesMenu } from '../../menu/sales';

import type { PageNode } from '@nikkierp/viewengine/metadata';


type Action = { command?: string, component?: string, actionCode?: string, condition?: unknown, openResult?: boolean };
type Assignment = { manageCommand: string, actionCode: string, actionResource?: string, pickerSchemaName: string };
type Tab = { label: string, schemaName: string, initialGraph?: unknown, assignment?: Assignment };

function detailOf(pages: PageNode[]): Record<string, unknown> {
	return (pages[0].props as { secondary: { props: Record<string, unknown> } }).secondary.props;
}

function actionsOf(pages: PageNode[]): Record<string, Action> {
	return (detailOf(pages).contextualActions ?? {}) as Record<string, Action>;
}

function tabsOf(pages: PageNode[]): Tab[] {
	return (detailOf(pages).relatedResources ?? []) as Tab[];
}

/** Every `lockedFields` map the page's form blocks declare, merged. */
function lockedFieldsOf(pages: PageNode[]): Record<string, { when?: unknown, hint: string }> {
	const found: Record<string, { when?: unknown, hint: string }> = {};
	const walk = (value: unknown): void => {
		if (Array.isArray(value)) {
			value.forEach(walk);
			return;
		}
		if (value === null || typeof value !== 'object') {
			return;
		}
		const locked = (value as { lockedFields?: Record<string, { when?: unknown, hint: string }> }).lockedFields;
		Object.assign(found, locked ?? {});
		Object.values(value).forEach(walk);
	};
	walk(detailOf(pages).childrenNodes);
	return found;
}

describe('Promotion page', () => {
	/** Copied from the application service's `AssertAction`; duplicate is a `create`. */
	it('declares the backend action code of every lifecycle action', () => {
		const actions = actionsOf(buildSalesPromotionPages());

		expect(Object.fromEntries(Object.entries(actions).map(([key, action]) => [key, action.actionCode]))).toEqual({
			activate: 'activate', suspend: 'suspend', duplicate: 'create', generate_vouchers: 'generate',
			add_rule: 'update', add_reward: 'update', select_all_channels: 'update', select_all_points: 'update',
		});
		expect(actions.duplicate.openResult).toBe(true);
		expect(actions.activate.condition).toEqual({
			field: 'status', operator: 'in', value: [c.PROMOTION_STATUS_DRAFT, c.PROMOTION_STATUS_SUSPENDED],
		});
		expect(actions.suspend.condition).toEqual({ field: 'status', operator: 'equal', value: 'active' });
	});

	it('archives through the standard action', () => {
		const commands = detailOf(buildSalesPromotionPages()).standardActionCommands as Record<string, string>;

		expect(commands.archive).toBe('core.resource.sales_promotion.set_is_archived');
	});

	/** Locked, not hidden: the configuration renders disabled with the hint while the promotion is active. */
	it('locks the configuration while active, with the suspend-first hint', () => {
		const locked = lockedFieldsOf(buildSalesPromotionPages());

		expect(Object.keys(locked).sort()).toEqual([
			'currency_id', 'ends_at', 'next_voucher_validity_days', 'program_type', 'sequence', 'starts_at',
			'usage_limit',
		]);
		for (const lock of Object.values(locked)) {
			expect(lock).toEqual({
				when: { field: 'status', operator: 'equal', value: 'active' }, hint: 'promotion_locked_hint',
			});
		}
	});

});

describe('Promotion page tabs', () => {
	it('filters the child tabs by promotion_id and the scope tabs through the linked edge', () => {
		const tabs = tabsOf(buildSalesPromotionPages());

		expect(tabs.map(tab => [tab.schemaName, tab.initialGraph])).toEqual([
			['sales_promotion_rule', { if: ['promotion_id', '=', '${id}'] }],
			['sales_promotion_reward', { if: ['promotion_id', '=', '${id}'] }],
			['sales_channel', { if: ['promotions', 'linked', '${id}'] }],
			['sales_point', { if: ['promotions', 'linked', '${id}'] }],
			['sales_pricelist', { if: ['promotions', 'linked', '${id}'] }],
			['sales_voucher', { if: ['promotion_id', '=', '${id}'] }],
			['sales_promotion_application', { if: ['promotion_id', '=', '${id}'] }],
		]);
	});

	/** The scope writes assert `update` on the promotion, not on the linked channel or point. */
	it('assigns channels, points and pricelists through manage_*', () => {
		const assignments = tabsOf(buildSalesPromotionPages()).flatMap(tab => (tab.assignment ? [tab.assignment] : []));

		expect(assignments.map(item => item.manageCommand)).toEqual([
			'sales.sales_promotion.manage_channels',
			'sales.sales_promotion.manage_points',
			'sales.sales_promotion.manage_pricelists',
		]);
		for (const item of assignments) {
			expect([item.actionCode, item.actionResource]).toEqual(['update', 'sales_promotion']);
		}
	});

	it('shows the next-order voucher validity only for a next-order coupon', () => {
		expect(JSON.stringify(detailOf(buildSalesPromotionPages()).childrenNodes)).toContain(
			JSON.stringify({ field: 'program_type', operator: 'equal', value: 'next_order_coupon' }),
		);
	});
});

describe('Promotion rule and reward pages', () => {
	it.each([
		['rule', buildSalesPromotionRulePages, 'rule_id', 'sales_promotion_rule'],
		['reward', buildSalesPromotionRewardPages, 'reward_id', 'sales_promotion_reward'],
	] as const)('the %s selector tabs filter by %s and write through its manage_*', (
		_name, build, ownerField, schemaName,
	) => {
		const tabs = tabsOf(build());

		expect(tabs.map(tab => tab.initialGraph)).toEqual([
			{ and: [{ if: [ownerField, '=', '${id}'] }, { if: ['product_template_id', 'is_set'] }] },
			{ and: [{ if: [ownerField, '=', '${id}'] }, { if: ['product_variant_id', 'is_set'] }] },
			{ if: [ownerField, '=', '${id}'] },
		]);
		expect(tabs.map(tab => [tab.assignment?.pickerSchemaName, tab.assignment?.manageCommand])).toEqual([
			['inventory_product_template', `sales.${schemaName}.manage_product_templates`],
			['inventory_product_variant', `sales.${schemaName}.manage_product_variants`],
			['inventory_product_category', `sales.${schemaName}.manage_categories`],
		]);
		for (const tab of tabs) {
			expect([tab.assignment?.actionCode, tab.assignment?.actionResource]).toEqual(['update', 'sales_promotion']);
		}
	});
});

describe('Voucher page', () => {
	it('revokes with its own action code, only while active', () => {
		const { revoke } = actionsOf(buildSalesVoucherPages());

		expect(revoke).toMatchObject({
			component: 'nikkierp.sales.components.revokeVoucherAction.v1', actionCode: 'revoke',
		});
		expect(revoke.condition).toEqual({ field: 'status', operator: 'equal', value: 'active' });
	});

	/** `source_order_id` is set only by the source order's Confirm, so a client cannot fake its history. */
	it('keeps the origin read-only after create and off the create form', () => {
		const detail = detailOf(buildSalesVoucherPages());

		expect(JSON.stringify(detail.createNodes)).not.toContain('"source_order_id"');
		expect(JSON.stringify(detail.childrenNodes)).toContain('"readOnlyFields":["customer_id","source_order_id"');
	});

	it('lists the applications by voucher_id', () => {
		expect(tabsOf(buildSalesVoucherPages()).map(tab => tab.initialGraph)).toEqual([
			{ if: ['voucher_id', '=', '${id}'] },
		]);
	});
});

describe('Promotion menu', () => {
	it('links promotions and vouchers to their routes', () => {
		const pricing = buildSalesMenu('commerce').items.find(item => item.labelKey === 'menu.pricing');
		const links = (pricing?.items ?? []).map(item => [item.labelKey, item.link]);

		expect(links).toContainEqual(['menu.promotions', '/sales_promotion']);
		expect(links).toContainEqual(['menu.vouchers', '/sales_voucher']);
	});
});
