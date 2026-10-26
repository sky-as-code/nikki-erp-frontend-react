import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesOrderFulfillmentItemService } from './salesOrderFulfillmentItemService';
import { SALES_MODULE, SALES_ORDER_FULFILLMENT_ITEM_SCHEMA_NAME } from '../../constants';


export const SalesOrderFulfillmentItemCommands = Object.freeze(
	resourceCommands(SALES_ORDER_FULFILLMENT_ITEM_SCHEMA_NAME),
);

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesOrderFulfillmentItemCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_ORDER_FULFILLMENT_ITEM_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_ORDER_FULFILLMENT_ITEM_SCHEMA_NAME, salesOrderFulfillmentItemService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
