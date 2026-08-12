import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { productTemplateAttributeService } from './productTemplateAttributeService';
import { INVENTORY_MODULE, PRODUCT_TEMPLATE_ATTRIBUTE_SCHEMA_NAME } from '../../constants';


/**
 * Command names for the template-attribute junction, all from the schema-driven generic path
 * (`core.resource.inventory_product_template_attribute.*`) served by the Shell's single prefix
 * subscription.
 *
 * The junction has no page of its own — it is reached as a related-records table on the template
 * detail page — but that table still publishes SEARCH, so the service must be registered.
 */
export const ProductTemplateAttributeCommands = Object.freeze(
	resourceCommands(PRODUCT_TEMPLATE_ATTRIBUTE_SCHEMA_NAME),
);

/**
 * Registers the template-attribute service. Called synchronously during the micro-app `init` so
 * the service is in place before any generic command is served.
 */
export function registerProductTemplateAttributeCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(PRODUCT_TEMPLATE_ATTRIBUTE_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(PRODUCT_TEMPLATE_ATTRIBUTE_SCHEMA_NAME, productTemplateAttributeService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
