import { definePage, PageNode } from '@nikkierp/viewengine/metadata';
import {
	collapsibleSectionNode, resourceDetailV2Props, resourceFormColumnNode, resourceListV2Props, resourceSplitViewProps,
} from '@nikkierp/viewkit-mantine/props';

import { MONEY_RENDERER, selectorResources } from './promotionShared';
import * as c from '../../constants/sales';
import { SalesPromotionRuleCommands } from '../../features/sales/salesPromotionRule/commands';
import { SalesPromotionRuleCategoryCommands } from '../../features/sales/salesPromotionRuleCategory/commands';
import { SalesPromotionRuleProductCommands } from '../../features/sales/salesPromotionRuleProduct/commands';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/** Mixed UoM categories cannot be summed into one quantity, so the threshold may never be reached (BR-C07). */
const MIXED_UOM_BADGE = { renderer: 'badge', colorMap: { true: 'orange', false: 'gray' }, prefix: 'has_mixed_uom.' };

/**
 * Reached from a promotion's Rules tab, not from the menu. Every write is refused while the promotion is active
 * (`config_locked`) and bumps its `config_version`.
 */
export function buildSalesPromotionRulePages(): PageNode[] {
	const splitView = resourceSplitViewProps({
		primary: buildSalesPromotionRuleListProps(),
		secondary: buildSalesPromotionRuleDetailProps(),
	});

	return [definePage({
		routePath: 'sales_promotion_rule',
		template: splitView.template,
		props: splitView.props,
	})];
}

function buildSalesPromotionRuleListProps() {
	return resourceListV2Props({
		schemaName: c.SALES_PROMOTION_RULE_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		linkField: 'id',
		searchCommand: SalesPromotionRuleCommands.SEARCH,
		createEnabled: true,
		deleteCommand: SalesPromotionRuleCommands.DELETE,
		fieldRenderers: { min_amount: MONEY_RENDERER, has_mixed_uom: MIXED_UOM_BADGE },
	});
}

function buildSalesPromotionRuleDetailProps() {
	return resourceDetailV2Props({
		schemaName: c.SALES_PROMOTION_RULE_SCHEMA_NAME,
		translationNs: c.SALES_MODULE,
		titleLvl1: { schemaField: 'name' },
		titleLvl2: { schemaField: 'promotion_id' },
		backLinkTitle: { linkHref: '../' },
		fieldRenderers: { min_amount: MONEY_RENDERER, has_mixed_uom: MIXED_UOM_BADGE },
		standardActionCommands: {
			getById: SalesPromotionRuleCommands.GET_BY_ID,
			create: SalesPromotionRuleCommands.CREATE,
			update: SalesPromotionRuleCommands.UPDATE,
			delete: SalesPromotionRuleCommands.DELETE,
		},
		createNodes: [buildSalesPromotionRuleFieldsSection(false)],
		childrenNodes: [buildSalesPromotionRuleFieldsSection(true)],
		relatedResources: selectorResources({
			ownerField: 'rule_id',
			productSchemaName: c.SALES_PROMOTION_RULE_PRODUCT_SCHEMA_NAME,
			categorySchemaName: c.SALES_PROMOTION_RULE_CATEGORY_SCHEMA_NAME,
			searchProducts: SalesPromotionRuleProductCommands.SEARCH,
			searchCategories: SalesPromotionRuleCategoryCommands.SEARCH,
			manageTemplates: SalesPromotionRuleCommands.MANAGE_PRODUCT_TEMPLATES,
			manageVariants: SalesPromotionRuleCommands.MANAGE_PRODUCT_VARIANTS,
			manageCategories: SalesPromotionRuleCommands.MANAGE_CATEGORIES,
		}),
		relatedResourcesNotice: 'promotion_rule_selector_notice',
	});
}

/** `issue` rules only matter to a next-order coupon: they decide whether the next coupon is issued. */
function buildSalesPromotionRuleFieldsSection(isUpdate: boolean): ComponentNode {
	return collapsibleSectionNode({
		layout: 'formBlocks',
		translationNs: c.SALES_MODULE,
		header: 'form.generalInformation',
	}, [
		resourceFormColumnNode({
			header: 'form.rule',
			fields: ['promotion_id', 'name', 'phase'],
		}),
		resourceFormColumnNode({
			header: 'form.threshold',
			fields: ['min_quantity', 'qualification_uom_id', 'min_amount', 'amount_tax_basis',
				...(isUpdate ? ['has_mixed_uom'] : [])],
			visibleWhen: {
				qualification_uom_id: { field: 'min_quantity', operator: 'exists' },
				amount_tax_basis: { field: 'min_amount', operator: 'exists' },
			},
		}),
	]);
}
