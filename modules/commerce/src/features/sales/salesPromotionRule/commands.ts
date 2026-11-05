import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesPromotionRuleService } from './salesPromotionRuleService';
import { SALES_PROMOTION_RULE_SCHEMA_NAME, SALES_MODULE } from '../../../constants/sales';
import { productDeltaRequest, scopeDeltaRequest } from '../promotionActions';


const PREFIX = `${SALES_MODULE}.${SALES_PROMOTION_RULE_SCHEMA_NAME}`;

/**
 * Both product commands post `manage_products`: the picker of each assignment tab hands over a template or a
 * variant id, and the command names which one it is.
 */
export const SalesPromotionRuleCommands = Object.freeze({
	...resourceCommands(SALES_PROMOTION_RULE_SCHEMA_NAME),
	MANAGE_PRODUCT_TEMPLATES: `${PREFIX}.manage_product_templates`,
	MANAGE_PRODUCT_VARIANTS: `${PREFIX}.manage_product_variants`,
	MANAGE_CATEGORIES: `${PREFIX}.manage_categories`,
} as const);

export function registerSalesPromotionRuleCommands(bus: ICommandBus): () => void {
	registerSchemaModule(SALES_PROMOTION_RULE_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_PROMOTION_RULE_SCHEMA_NAME, salesPromotionRuleService);

	const unsubscribers = [
		bus.subscribe(
			SalesPromotionRuleCommands.MANAGE_PRODUCT_TEMPLATES,
			cmd => salesPromotionRuleService.manageProducts(productDeltaRequest(cmd, 'product_template_id')),
		),
		bus.subscribe(
			SalesPromotionRuleCommands.MANAGE_PRODUCT_VARIANTS,
			cmd => salesPromotionRuleService.manageProducts(productDeltaRequest(cmd, 'product_variant_id')),
		),
		bus.subscribe(
			SalesPromotionRuleCommands.MANAGE_CATEGORIES,
			cmd => salesPromotionRuleService.manageCategories(scopeDeltaRequest(cmd)),
		),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}
