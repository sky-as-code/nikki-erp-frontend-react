import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { productTemplateAttributeValueService } from './productTemplateAttributeValueService';
import { INVENTORY_MODULE, PRODUCT_TEMPLATE_ATTRIBUTE_VALUE_SCHEMA_NAME } from '../../constants';


/**
 * Command names for the template-attribute-value junction, all from the schema-driven generic path
 * (`core.resource.inventory_product_template_attribute_value.*`).
 *
 * The schema was already registered so relation selects could resolve it, but with no service
 * behind it nothing could read or write a row. That was enough while it held only a link and a
 * sequence; it stopped being enough when `sales_price_extra` moved here, because a number nobody
 * can edit is a number nobody can set.
 */
export const ProductTemplateAttributeValueCommands = Object.freeze(
	resourceCommands(PRODUCT_TEMPLATE_ATTRIBUTE_VALUE_SCHEMA_NAME),
);

/**
 * Registers the service. Called synchronously during the micro-app `init` so it is in place before
 * any generic command is served.
 */
export function registerProductTemplateAttributeValueCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(PRODUCT_TEMPLATE_ATTRIBUTE_VALUE_SCHEMA_NAME, INVENTORY_MODULE);
	registerCrudService(PRODUCT_TEMPLATE_ATTRIBUTE_VALUE_SCHEMA_NAME, productTemplateAttributeValueService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
