import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { stockQuantService } from './stockQuantService';
import { INVENTORY_MODULE, STOCK_QUANT_SCHEMA_NAME } from '../../constants';


/**
 * Command names for the stock balance resource, all from the schema-driven generic path
 * (`core.resource.inventory_stock_quant.*`) served by the Shell's single prefix subscription.
 *
 * The write names exist because `resourceCommands` generates the full set from the schema name,
 * but the backend refuses them: no page binds them to an action.
 */
export const StockQuantCommands = Object.freeze(resourceCommands(STOCK_QUANT_SCHEMA_NAME));

/**
 * Registers the stock balance service. Called synchronously during the micro-app `init` so the
 * service is in place before any generic command is served.
 */
export function registerStockQuantCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(STOCK_QUANT_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(STOCK_QUANT_SCHEMA_NAME, stockQuantService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
