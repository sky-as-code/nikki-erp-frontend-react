import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { stockOperationTypeService } from './stockOperationTypeService';
import { INVENTORY_MODULE, STOCK_OPERATION_TYPE_SCHEMA_NAME } from '../../constants';


/**
 * Command names for the stock operation type resource, all from the schema-driven generic path
 * (`core.resource.inventory_stock_operation_type.*`) served by the Shell's prefix subscription.
 */
export const StockOperationTypeCommands = Object.freeze(
	resourceCommands(STOCK_OPERATION_TYPE_SCHEMA_NAME),
);

/**
 * Registers the stock operation type service.
 *
 * The resource has no page of its own yet — nothing consumes an operation type until transfers
 * exist — but it is registered so that a relation select pointing at it can already resolve.
 */
export function registerStockOperationTypeCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(STOCK_OPERATION_TYPE_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(STOCK_OPERATION_TYPE_SCHEMA_NAME, stockOperationTypeService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
