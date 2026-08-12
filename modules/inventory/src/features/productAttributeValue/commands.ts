import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { productAttributeValueService } from './productAttributeValueService';
import { INVENTORY_MODULE, PRODUCT_ATTRIBUTE_VALUE_SCHEMA_NAME } from '../../constants';


/**
 * Command names for the attribute value resource, all from the schema-driven generic path
 * (`core.resource.inventory_product_attribute_value.*`) served by the Shell's single prefix
 * subscription.
 */
export const ProductAttributeValueCommands = Object.freeze(
	resourceCommands(PRODUCT_ATTRIBUTE_VALUE_SCHEMA_NAME),
);

/**
 * Registers the attribute value service. Called synchronously during the micro-app `init` so the
 * service is in place before any generic command is served.
 */
export function registerProductAttributeValueCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(PRODUCT_ATTRIBUTE_VALUE_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(PRODUCT_ATTRIBUTE_VALUE_SCHEMA_NAME, productAttributeValueService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
