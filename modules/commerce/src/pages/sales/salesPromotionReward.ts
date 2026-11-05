import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import { MONEY_RENDERER, QUANTITY_RENDERER, REWARD_TYPE_BADGE, selectorResources } from './promotionShared';
import * as c from '../../constants/sales';
import { SalesPromotionRewardCommands } from '../../features/sales/salesPromotionReward/commands';
import { SalesPromotionRewardCategoryCommands } from '../../features/sales/salesPromotionRewardCategory/commands';
import { SalesPromotionRewardProductCommands } from '../../features/sales/salesPromotionRewardProduct/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


const IS_DISCOUNT = { field: 'reward_type', operator: 'equal' as const, value: c.PROMOTION_REWARD_TYPE_DISCOUNT };
const IS_FREE_PRODUCT = {
	field: 'reward_type', operator: 'equal' as const, value: c.PROMOTION_REWARD_TYPE_FREE_PRODUCT,
};

/** A percentage or an amount, by discount method, so a plain two-decimal number fits both. */
const DISCOUNT_VALUE_RENDERER = { renderer: 'float', precision: 2 };

/**
 * Reached from a promotion's Rewards tab, not from the menu. `free_shipping` is declared but never applies:
 * Sales has no shipping line, so the quote always reports it `not_applicable` (`no_shipping_line`).
 */
export function buildSalesPromotionRewardPages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildSalesPromotionRewardListProps(),
		secondary: buildSalesPromotionRewardDetailProps(),
	});

	return [definePage({
		routePath: 'sales_promotion_reward',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildSalesPromotionRewardListProps() {
	return resourceListV2Props({
		schemaName: c.SALES_PROMOTION_REWARD_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesPromotionRewardCommands.SEARCH,
		createEnabled: true,
		deleteCommand: SalesPromotionRewardCommands.DELETE,
		fieldRenderers: { reward_type: REWARD_TYPE_BADGE, discount_value: DISCOUNT_VALUE_RENDERER },
	});
}

function buildSalesPromotionRewardDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.SALES_PROMOTION_REWARD_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		titleLvl1: { schemaField: 'order_description' },
		titleLvl2: { schemaField: 'reward_type' },
		backLinkTitle: { linkHref: '../' },
		fieldRenderers: {
			reward_type: REWARD_TYPE_BADGE,
			discount_value: DISCOUNT_VALUE_RENDERER,
			max_discount_amount: MONEY_RENDERER,
			gift_quantity: QUANTITY_RENDERER,
		},
		standardActionCommands: {
			getById: SalesPromotionRewardCommands.GET_BY_ID,
			create: SalesPromotionRewardCommands.CREATE,
			update: SalesPromotionRewardCommands.UPDATE,
			delete: SalesPromotionRewardCommands.DELETE,
		},
		createNodes: [buildSalesPromotionRewardFieldsSection()],
		childrenNodes: [buildSalesPromotionRewardFieldsSection()],
		relatedResources: selectorResources({
			ownerField: 'reward_id',
			productSchemaName: c.SALES_PROMOTION_REWARD_PRODUCT_SCHEMA_NAME,
			categorySchemaName: c.SALES_PROMOTION_REWARD_CATEGORY_SCHEMA_NAME,
			searchProducts: SalesPromotionRewardProductCommands.SEARCH,
			searchCategories: SalesPromotionRewardCategoryCommands.SEARCH,
			manageTemplates: SalesPromotionRewardCommands.MANAGE_PRODUCT_TEMPLATES,
			manageVariants: SalesPromotionRewardCommands.MANAGE_PRODUCT_VARIANTS,
			manageCategories: SalesPromotionRewardCommands.MANAGE_CATEGORIES,
		}),
		relatedResourcesNotice: 'promotion_reward_selector_notice',
	});
}

/** Each block shows only the fields its reward type uses; hidden fields keep their value. */
function buildSalesPromotionRewardFieldsSection(): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.SALES_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.reward',
			fields: ['promotion_id', 'reward_type', 'order_description'],
		}),
		resourceFormColumnNode({
			header: 'form.discount',
			fields: ['discount_method', 'discount_value', 'discount_scope', 'max_discount_amount'],
			visibleWhen: {
				discount_method: IS_DISCOUNT,
				discount_value: IS_DISCOUNT,
				discount_scope: IS_DISCOUNT,
				max_discount_amount: IS_DISCOUNT,
			},
		}),
		resourceFormColumnNode({
			header: 'form.gift',
			fields: ['gift_product_variant_id', 'gift_quantity', 'gift_uom_id'],
			visibleWhen: {
				gift_product_variant_id: IS_FREE_PRODUCT,
				gift_quantity: IS_FREE_PRODUCT,
				gift_uom_id: IS_FREE_PRODUCT,
			},
		}),
	]);
}
