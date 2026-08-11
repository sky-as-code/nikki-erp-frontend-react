import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { productAttributeService } from './productAttributeService';
import { INVENTORY_MODULE, PRODUCT_ATTRIBUTE_SCHEMA_NAME } from '../../constants';


/**
 * Command names for the product attribute resource, all from the schema-driven generic path
 * (`core.resource.inventory_product_attribute.*`) served by the Shell's single prefix subscription.
 */
export const ProductAttributeCommands = Object.freeze(resourceCommands(PRODUCT_ATTRIBUTE_SCHEMA_NAME));

/**
 * Registers the product attribute service. Called synchronously during the micro-app `init` so the
 * service is in place before any generic command is served.
 */
export function registerProductAttributeCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(PRODUCT_ATTRIBUTE_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(PRODUCT_ATTRIBUTE_SCHEMA_NAME, productAttributeService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
