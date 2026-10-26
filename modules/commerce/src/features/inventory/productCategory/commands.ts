import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { productCategoryService } from './productCategoryService';
import { INVENTORY_MODULE, PRODUCT_CATEGORY_SCHEMA_NAME } from '../../constants';


/**
 * Command names for the product category resource, all from the schema-driven generic path
 * (`core.resource.inventory_product_category.*`) served by the Shell's single prefix subscription.
 */
export const ProductCategoryCommands = Object.freeze(resourceCommands(PRODUCT_CATEGORY_SCHEMA_NAME));

/**
 * Registers the product category service. Called synchronously during the micro-app `init` so the
 * service is in place before any generic command is served.
 */
export function registerProductCategoryCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(PRODUCT_CATEGORY_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(PRODUCT_CATEGORY_SCHEMA_NAME, productCategoryService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
