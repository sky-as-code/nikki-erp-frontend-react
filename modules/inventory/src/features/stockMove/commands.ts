import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { stockMoveService } from './stockMoveService';
import { INVENTORY_MODULE, STOCK_MOVE_SCHEMA_NAME } from '../../constants';


/**
 * Command names for the stock move resource, all from the schema-driven generic path
 * (`core.resource.inventory_stock_move.*`) served by the Shell's single prefix subscription.
 */
export const StockMoveCommands = Object.freeze(resourceCommands(STOCK_MOVE_SCHEMA_NAME));

/**
 * Registers the stock move service. Called synchronously during the micro-app `init` so the
 * service is in place before any generic command is served.
 */
export function registerStockMoveCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(STOCK_MOVE_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(STOCK_MOVE_SCHEMA_NAME, stockMoveService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
