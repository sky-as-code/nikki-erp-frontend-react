import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesPromotionRewardService } from './salesPromotionRewardService';
import { SALES_PROMOTION_REWARD_SCHEMA_NAME, SALES_MODULE } from '../../../constants/sales';
import { productDeltaRequest, scopeDeltaRequest } from '../promotionActions';


const PREFIX = `${SALES_MODULE}.${SALES_PROMOTION_REWARD_SCHEMA_NAME}`;

/**
 * Both product commands post `manage_products`: the picker of each assignment tab hands over a template or a
 * variant id, and the command names which one it is.
 */
export const SalesPromotionRewardCommands = Object.freeze({
	...resourceCommands(SALES_PROMOTION_REWARD_SCHEMA_NAME),
	MANAGE_PRODUCT_TEMPLATES: `${PREFIX}.manage_product_templates`,
	MANAGE_PRODUCT_VARIANTS: `${PREFIX}.manage_product_variants`,
	MANAGE_CATEGORIES: `${PREFIX}.manage_categories`,
} as const);

export function registerSalesPromotionRewardCommands(bus: ICommandBus): () => void {
	registerSchemaModule(SALES_PROMOTION_REWARD_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_PROMOTION_REWARD_SCHEMA_NAME, salesPromotionRewardService);

	const unsubscribers = [
		bus.subscribe(
			SalesPromotionRewardCommands.MANAGE_PRODUCT_TEMPLATES,
			cmd => salesPromotionRewardService.manageProducts(productDeltaRequest(cmd, 'product_template_id')),
		),
		bus.subscribe(
			SalesPromotionRewardCommands.MANAGE_PRODUCT_VARIANTS,
			cmd => salesPromotionRewardService.manageProducts(productDeltaRequest(cmd, 'product_variant_id')),
		),
		bus.subscribe(
			SalesPromotionRewardCommands.MANAGE_CATEGORIES,
			cmd => salesPromotionRewardService.manageCategories(scopeDeltaRequest(cmd)),
		),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}
