import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesPromotionAllocationService } from './salesPromotionAllocationService';
import { SALES_PROMOTION_ALLOCATION_SCHEMA_NAME, SALES_MODULE } from '../../../constants/sales';


export const SalesPromotionAllocationCommands = Object.freeze(resourceCommands(SALES_PROMOTION_ALLOCATION_SCHEMA_NAME));

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesPromotionAllocationCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_PROMOTION_ALLOCATION_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_PROMOTION_ALLOCATION_SCHEMA_NAME, salesPromotionAllocationService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
