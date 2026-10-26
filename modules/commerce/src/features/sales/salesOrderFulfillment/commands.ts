import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesOrderFulfillmentService } from './salesOrderFulfillmentService';
import { SALES_MODULE, SALES_ORDER_FULFILLMENT_SCHEMA_NAME } from '../../constants';


export const SalesOrderFulfillmentCommands = Object.freeze(resourceCommands(SALES_ORDER_FULFILLMENT_SCHEMA_NAME));

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesOrderFulfillmentCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_ORDER_FULFILLMENT_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_ORDER_FULFILLMENT_SCHEMA_NAME, salesOrderFulfillmentService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
