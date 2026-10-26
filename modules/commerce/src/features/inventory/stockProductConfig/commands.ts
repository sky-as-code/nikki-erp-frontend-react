import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { stockProductConfigService } from './stockProductConfigService';
import { INVENTORY_MODULE, STOCK_PRODUCT_CONFIG_SCHEMA_NAME } from '../../constants';


/**
 * Command names for the resource, all from the schema-driven generic path
 * (`core.resource.inventory_stock_product_config.*`) served by the Shell's single prefix
 * subscription.
 *
 * Nothing here is beyond CRUD. The one rule this resource carries — that the unit cannot change
 * once the product has stock — is enforced by the engine on update, not by a separate action.
 */
export const StockProductConfigCommands = Object.freeze(
	resourceCommands(STOCK_PRODUCT_CONFIG_SCHEMA_NAME),
);

/**
 * Registers the service. Called synchronously during the micro-app `init` so the service is in
 * place before any generic command is served.
 */
export function registerStockProductConfigCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(STOCK_PRODUCT_CONFIG_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(STOCK_PRODUCT_CONFIG_SCHEMA_NAME, stockProductConfigService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
