import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesPromotionRewardProductService } from './salesPromotionRewardProductService';
import { SALES_PROMOTION_REWARD_PRODUCT_SCHEMA_NAME, SALES_MODULE } from '../../../constants/sales';


export const SalesPromotionRewardProductCommands = Object.freeze(
	resourceCommands(SALES_PROMOTION_REWARD_PRODUCT_SCHEMA_NAME),
);

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesPromotionRewardProductCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_PROMOTION_REWARD_PRODUCT_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_PROMOTION_REWARD_PRODUCT_SCHEMA_NAME, salesPromotionRewardProductService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
