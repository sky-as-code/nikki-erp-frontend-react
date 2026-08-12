import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { stockLocationService } from './stockLocationService';
import { INVENTORY_MODULE, STOCK_LOCATION_SCHEMA_NAME } from '../../constants';


/**
 * Command names for the stock location resource, all from the schema-driven generic path
 * (`core.resource.inventory_stock_location.*`) served by the Shell's single prefix subscription.
 */
export const StockLocationCommands = Object.freeze(resourceCommands(STOCK_LOCATION_SCHEMA_NAME));

/**
 * Registers the stock location service. Called synchronously during the micro-app `init` so the
 * service is in place before any generic command is served.
 */
export function registerStockLocationCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(STOCK_LOCATION_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(STOCK_LOCATION_SCHEMA_NAME, stockLocationService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
