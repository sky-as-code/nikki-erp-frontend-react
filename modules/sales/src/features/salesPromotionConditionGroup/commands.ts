import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesPromotionConditionGroupService } from './salesPromotionConditionGroupService';
import { SALES_PROMOTION_CONDITION_GROUP_SCHEMA_NAME, SALES_MODULE } from '../../constants';


export const SalesPromotionConditionGroupCommands = Object.freeze(
	resourceCommands(SALES_PROMOTION_CONDITION_GROUP_SCHEMA_NAME),
);

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesPromotionConditionGroupCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_PROMOTION_CONDITION_GROUP_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_PROMOTION_CONDITION_GROUP_SCHEMA_NAME, salesPromotionConditionGroupService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
