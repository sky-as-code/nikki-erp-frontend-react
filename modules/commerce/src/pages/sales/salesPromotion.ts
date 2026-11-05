import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
	statusStripProps,
} from '@nikkierp/viewkit-mantine/props';

import {
	APPLICATION_STATUS_BADGE, MONEY_RENDERER, PROGRAM_TYPE_BADGE, PROMOTION_AVAILABILITY_BADGE, PROMOTION_STATUS_BADGE,
	PROMOTION_UPDATE_LOCK,
	REWARD_TYPE_BADGE, VOUCHER_AVAILABILITY_BADGE,
} from './promotionShared';
import * as c from '../../constants/sales';
import { SalesChannelCommands } from '../../features/sales/salesChannel/commands';
import { SalesPointCommands } from '../../features/sales/salesPoint/commands';
import { SalesPricelistCommands } from '../../features/sales/salesPricelist/commands';
import { SalesPromotionCommands } from '../../features/sales/salesPromotion/commands';
import { SalesPromotionApplicationCommands } from '../../features/sales/salesPromotionApplication/commands';
import { SalesPromotionRewardCommands } from '../../features/sales/salesPromotionReward/commands';
import { SalesPromotionRuleCommands } from '../../features/sales/salesPromotionRule/commands';
import { SalesVoucherCommands } from '../../features/sales/salesVoucher/commands';
import {
	ADD_REWARD_ACTION, ADD_RULE_ACTION, GENERATE_VOUCHERS_ACTION, SELECT_ALL_CHANNELS_ACTION, SELECT_ALL_POINTS_ACTION,
} from '../../viewkit/sales/props';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * The configuration an active promotion freezes. The backend refuses the write (`config_locked`) either way;
 * locking them here says why before the user types. `name` and `description` stay editable.
 */
const LOCKED_WHILE_ACTIVE = ['program_type', 'currency_id', 'starts_at', 'ends_at', 'usage_limit', 'sequence',
	'next_voucher_validity_days'];

/** The scope tables list the linked records through their many:many edge back to the promotion. */
const PROMOTIONS_EDGE = 'promotions';

export function buildSalesPromotionPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildSalesPromotionListProps(),
		secondary: buildSalesPromotionDetailProps(),
	});

	return [definePage({
		routePath: 'sales_promotion',
		template: splitView.template,
		props: splitView.props,
	})];
}

/** No inline editing: a row edit would bypass the lock hint of an active promotion. */
function buildSalesPromotionListProps() {
	return resourceListV2Props({
		schemaName: c.SALES_PROMOTION_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesPromotionCommands.SEARCH,
		createEnabled: true,
		archiveCommand: SalesPromotionCommands.SET_IS_ARCHIVED,
		fieldRenderers: {
			status: PROMOTION_STATUS_BADGE,
			program_type: PROGRAM_TYPE_BADGE,
			availability: PROMOTION_AVAILABILITY_BADGE,
		},
	});
}

function buildSalesPromotionDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.SALES_PROMOTION_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		...statusStripProps({
			statuses: Object.keys(PROMOTION_STATUS_BADGE.colorMap),
			prefix: PROMOTION_STATUS_BADGE.prefix,
			alternativeEnds: [c.PROMOTION_STATUS_SUSPENDED],
		}),
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'reference' },
		backLinkTitle: { linkHref: '../' },
		fieldRenderers: { program_type: PROGRAM_TYPE_BADGE, availability: PROMOTION_AVAILABILITY_BADGE },
		standardActionCommands: {
			getById: SalesPromotionCommands.GET_BY_ID,
			create: SalesPromotionCommands.CREATE,
			update: SalesPromotionCommands.UPDATE,
			delete: SalesPromotionCommands.DELETE,
			archive: SalesPromotionCommands.SET_IS_ARCHIVED,
		},
		contextualActions: buildSalesPromotionActions(),
		createNodes: [buildSalesPromotionFieldsSection(false)],
		childrenNodes: [buildSalesPromotionFieldsSection(true)],
		relatedResources: buildSalesPromotionResources(),
		relatedResourcesNotice: 'promotion_related_notice',
	});
}

function buildSalesPromotionFieldsSection(isUpdate: boolean): ComponentNode {
	const lockedFields = isUpdate ? lockedWhileActive() : undefined;
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.SALES_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.program',
			// `reference` is issued by the Sequence on create, so it is shown once it exists.
			fields: [...(isUpdate ? ['reference'] : []), 'name', 'program_type', 'currency_id', 'sequence',
				'description'],
			lockedFields,
		}),
		resourceFormColumnNode({
			header: 'form.validityUsage',
			// `used_count` is consumed atomically by Confirm and released by Cancel, never written here.
			fields: ['starts_at', 'ends_at', 'usage_limit', ...(isUpdate ? ['used_count', 'availability'] : [])],
			lockedFields,
		}),
		resourceFormColumnNode({
			header: 'form.nextOrderVoucher',
			fields: ['next_voucher_validity_days'],
			visibleWhen: {
				next_voucher_validity_days: {
					field: 'program_type', operator: 'equal', value: c.PROMOTION_TYPE_NEXT_ORDER_COUPON,
				},
			},
			lockedFields,
		}),
		resourceFormColumnNode({
			header: 'form.other_information',
			fields: isUpdate ? ['config_version', 'is_archived'] : ['is_archived'],
		}),
	]);
}

function lockedWhileActive() {
	const lock = {
		when: { field: 'status', operator: 'equal' as const, value: c.PROMOTION_STATUS_ACTIVE },
		hint: 'promotion_locked_hint',
	};
	return Object.fromEntries(LOCKED_WHILE_ACTIVE.map(field => [field, lock]));
}

/**
 * Activate from draft or suspended; it validates the whole configuration and never fills in a missing scope.
 * Duplicate is a `create`: it opens the new draft, which has its own reference and no vouchers or usage.
 */
function buildSalesPromotionActions() {
	return {
		activate: {
			label: 'actions.activate',
			command: SalesPromotionCommands.ACTIVATE,
			actionCode: 'activate',
			condition: {
				field: 'status',
				operator: 'in' as const,
				value: [c.PROMOTION_STATUS_DRAFT, c.PROMOTION_STATUS_SUSPENDED],
			},
		},
		suspend: {
			label: 'actions.suspend',
			command: SalesPromotionCommands.SUSPEND,
			actionCode: 'suspend',
			condition: { field: 'status', operator: 'equal' as const, value: c.PROMOTION_STATUS_ACTIVE },
		},
		duplicate: {
			label: 'actions.duplicate',
			command: SalesPromotionCommands.DUPLICATE,
			actionCode: 'create',
			openResult: true,
		},
		...buildSalesPromotionSetupActions(),
	};
}

/**
 * Hand-written header actions: each component locks itself on what it asserts. Generate is for the
 * voucher-gated types only (next-order coupons are issued by orders); the setup shortcuts only while the
 * configuration is editable.
 */
function buildSalesPromotionSetupActions() {
	const whileEditable = {
		field: 'status', operator: 'in' as const, value: [c.PROMOTION_STATUS_DRAFT, c.PROMOTION_STATUS_SUSPENDED],
	};
	return {
		generate_vouchers: {
			label: 'promotion.generate.button',
			component: GENERATE_VOUCHERS_ACTION,
			actionCode: 'generate',
			condition: {
				field: 'program_type', operator: 'in' as const,
				value: [c.PROMOTION_TYPE_DISCOUNT_CODE, c.PROMOTION_TYPE_COUPON],
			},
		},
		add_rule: { label: 'promotion.add_rule', component: ADD_RULE_ACTION, actionCode: 'update', condition: whileEditable },
		add_reward: {
			label: 'promotion.add_reward', component: ADD_REWARD_ACTION, actionCode: 'update', condition: whileEditable,
		},
		select_all_channels: {
			label: 'promotion.scope.select_all_channels', component: SELECT_ALL_CHANNELS_ACTION, actionCode: 'update',
			condition: whileEditable,
		},
		select_all_points: {
			label: 'promotion.scope.select_all_points', component: SELECT_ALL_POINTS_ACTION, actionCode: 'update',
			condition: whileEditable,
		},
	};
}

function buildSalesPromotionResources() {
	return [
		buildRulesResource(),
		buildRewardsResource(),
		scopeResource('promotion_sections_channels', c.SALES_CHANNEL_SCHEMA_NAME, SalesChannelCommands.SEARCH,
			SalesPromotionCommands.MANAGE_CHANNELS, 'promotion_assign_channel'),
		scopeResource('promotion_sections_points', c.SALES_POINT_SCHEMA_NAME, SalesPointCommands.SEARCH,
			SalesPromotionCommands.MANAGE_POINTS, 'promotion_assign_point'),
		scopeResource('promotion_sections_pricelists', c.SALES_PRICELIST_SCHEMA_NAME, SalesPricelistCommands.SEARCH,
			SalesPromotionCommands.MANAGE_PRICELISTS, 'promotion_assign_pricelist'),
		buildVouchersResource(),
		buildApplicationsResource(),
	];
}

function buildRulesResource() {
	return {
		label: 'promotion_sections_rules',
		emptyMessage: 'promotion_rules_empty',
		schemaName: c.SALES_PROMOTION_RULE_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		searchCommand: SalesPromotionRuleCommands.SEARCH,
		initialGraph: { if: ['promotion_id', '=', '${id}'] },
		fields: ['name', 'phase', 'min_quantity', 'qualification_uom_id', 'min_amount', 'amount_tax_basis',
			'has_mixed_uom'],
		fieldRenderers: {
			phase: { renderer: 'badge', colorMap: { apply: 'blue', issue: 'indigo' }, prefix: 'promotion_rule_phase.' },
			min_amount: MONEY_RENDERER,
			has_mixed_uom: { renderer: 'badge', colorMap: { true: 'orange' }, prefix: 'has_mixed_uom.' },
		},
		linkField: 'id',
		linkRoutePath: 'sales_promotion_rule',
		showViewAll: true,
		viewAllFiltered: true,
	};
}

function buildRewardsResource() {
	return {
		label: 'promotion_sections_rewards',
		emptyMessage: 'promotion_rewards_empty',
		schemaName: c.SALES_PROMOTION_REWARD_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		searchCommand: SalesPromotionRewardCommands.SEARCH,
		initialGraph: { if: ['promotion_id', '=', '${id}'] },
		fields: ['reward_type', 'order_description', 'discount_method', 'discount_value', 'discount_scope',
			'gift_product_variant_id', 'gift_quantity'],
		fieldRenderers: { reward_type: REWARD_TYPE_BADGE, gift_quantity: { renderer: 'float' } },
		linkField: 'id',
		linkRoutePath: 'sales_promotion_reward',
		showViewAll: true,
		viewAllFiltered: true,
	};
}

/**
 * Channel, point and pricelist links have no resource of their own: the tab lists the linked records and writes
 * through the promotion's `manage_*`. A promotion needs both a channel and a point to apply (BR-S01).
 */
function scopeResource(
	label: string, schemaName: string, searchCommand: string, manageCommand: string, newRowPrompt: string,
) {
	return {
		label,
		emptyMessage: 'promotion_scope_empty',
		schemaName,
		translationNs: c.SALES_MODULE,
		searchCommand,
		initialGraph: { if: [PROMOTIONS_EDGE, 'linked', '${id}'] },
		fields: ['name', 'code'],
		linkField: 'id',
		linkRoutePath: schemaName,
		assignment: {
			...PROMOTION_UPDATE_LOCK,
			pickerSchemaName: schemaName,
			manageCommand,
			newRowPrompt,
			newRowSearchField: 'name',
			btnDeleteLabel: 'common:action.unassign',
		},
	};
}

function buildVouchersResource() {
	return {
		label: 'promotion_sections_vouchers',
		emptyMessage: 'promotion_vouchers_empty',
		schemaName: c.SALES_VOUCHER_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		searchCommand: SalesVoucherCommands.SEARCH,
		initialGraph: { if: ['promotion_id', '=', '${id}'] },
		fields: ['code', 'voucher_type', 'availability', 'customer_id', 'expires_at', 'used_count', 'usage_limit'],
		fieldRenderers: { availability: VOUCHER_AVAILABILITY_BADGE },
		linkField: 'id',
		linkRoutePath: 'sales_voucher',
		showViewAll: true,
		viewAllFiltered: true,
	};
}

/** Read-only: written by Confirm, reversed by Cancel. Readable with `read` on `sales_order`. */
function buildApplicationsResource() {
	return {
		label: 'promotion_sections_applications',
		emptyMessage: 'promotion_applications_empty',
		schemaName: c.SALES_PROMOTION_APPLICATION_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		searchCommand: SalesPromotionApplicationCommands.SEARCH,
		initialGraph: { if: ['promotion_id', '=', '${id}'] },
		fields: ['order_id', 'status', 'voucher_id', 'discount_total_amount', 'applied_at', 'reversed_at'],
		fieldRenderers: { status: APPLICATION_STATUS_BADGE, discount_total_amount: MONEY_RENDERER },
		linkField: 'order_id',
		linkRoutePath: 'sales_order',
	};
}
