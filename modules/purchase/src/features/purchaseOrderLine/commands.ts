import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { purchaseOrderLineService } from './purchaseOrderLineService';
import { PURCHASE_ORDER_LINE_SCHEMA_NAME, PURCHASE_MODULE } from '../../constants';


/**
 * Command names for this resource, all from the schema-driven generic path
 * (`core.resource.purchase_order_line.*`) served by the Shell's single prefix subscription.
 */
export const PurchaseOrderLineCommands = Object.freeze(resourceCommands(PURCHASE_ORDER_LINE_SCHEMA_NAME));

/**
 * Registers the service. Called synchronously during the micro-app `init` so it is in place
 * before any generic command is served.
 */
export function registerPurchaseOrderLineCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(PURCHASE_ORDER_LINE_SCHEMA_NAME, PURCHASE_MODULE);
	registerCrudService(PURCHASE_ORDER_LINE_SCHEMA_NAME, purchaseOrderLineService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
