import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { productPriceService } from './productPriceService';
import { INVENTORY_MODULE, PRODUCT_PRICE_SCHEMA_NAME } from '../../constants';


/**
 * Command names for the product price resource, all from the schema-driven generic path
 * (`core.resource.inventory_product_price.*`) served by the Shell's single prefix subscription.
 */
export const ProductPriceCommands = Object.freeze(resourceCommands(PRODUCT_PRICE_SCHEMA_NAME));

/**
 * Registers the product price service. Called synchronously during the micro-app `init` so the
 * service is in place before any generic command is served.
 */
export function registerProductPriceCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(PRODUCT_PRICE_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(PRODUCT_PRICE_SCHEMA_NAME, productPriceService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
