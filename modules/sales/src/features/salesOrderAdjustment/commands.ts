import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesOrderAdjustmentService } from './salesOrderAdjustmentService';
import { SALES_ORDER_ADJUSTMENT_SCHEMA_NAME, SALES_MODULE } from '../../constants';


export const SalesOrderAdjustmentCommands = Object.freeze(resourceCommands(SALES_ORDER_ADJUSTMENT_SCHEMA_NAME));

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesOrderAdjustmentCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_ORDER_ADJUSTMENT_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_ORDER_ADJUSTMENT_SCHEMA_NAME, salesOrderAdjustmentService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
