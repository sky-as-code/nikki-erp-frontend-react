import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { stockMoveLineService } from './stockMoveLineService';
import { INVENTORY_MODULE, STOCK_MOVE_LINE_SCHEMA_NAME } from '../../constants';


/**
 * Command names for the stock move line resource, all from the schema-driven generic path
 * (`core.resource.inventory_stock_move_line.*`) served by the Shell's single prefix subscription.
 *
 * The write names exist because `resourceCommands` generates the full set from the schema name,
 * but the backend refuses them: lines are written by the reservation engine, and a client-written
 * allocation would be a claim the balance itself knows nothing about. No page binds them.
 */
export const StockMoveLineCommands = Object.freeze(resourceCommands(STOCK_MOVE_LINE_SCHEMA_NAME));

/**
 * Registers the stock move line service. Called synchronously during the micro-app `init` so the
 * service is in place before any generic command is served.
 */
export function registerStockMoveLineCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(STOCK_MOVE_LINE_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(STOCK_MOVE_LINE_SCHEMA_NAME, stockMoveLineService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
