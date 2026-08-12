import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { productTypeService } from './productTypeService';
import { INVENTORY_MODULE, PRODUCT_TYPE_SCHEMA_NAME } from '../../constants';


/**
 * Command names for the product type resource, all from the schema-driven generic path
 * (`core.resource.inventory_product_type.*`) served by the Shell's single prefix subscription.
 */
export const ProductTypeCommands = Object.freeze(resourceCommands(PRODUCT_TYPE_SCHEMA_NAME));

/**
 * Registers the product type service. Called synchronously during the micro-app `init` so the
 * service is in place before any generic command is served.
 */
export function registerProductTypeCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(PRODUCT_TYPE_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(PRODUCT_TYPE_SCHEMA_NAME, productTypeService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
