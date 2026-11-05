import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesOrderPromotionSelectionService } from './salesOrderPromotionSelectionService';
import { SALES_ORDER_PROMOTION_SELECTION_SCHEMA_NAME, SALES_MODULE } from '../../../constants/sales';


export const SalesOrderPromotionSelectionCommands = Object.freeze(
	resourceCommands(SALES_ORDER_PROMOTION_SELECTION_SCHEMA_NAME),
);

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesOrderPromotionSelectionCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_ORDER_PROMOTION_SELECTION_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_ORDER_PROMOTION_SELECTION_SCHEMA_NAME, salesOrderPromotionSelectionService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
