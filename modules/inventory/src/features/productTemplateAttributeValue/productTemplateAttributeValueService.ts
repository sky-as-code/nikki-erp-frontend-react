import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, PRODUCT_TEMPLATE_ATTRIBUTE_VALUE_SCHEMA_NAME } from '../../constants';
import { inventoryStore } from '../../store';


/**
 * CRUD over `inventory_product_template_attribute_value` — which values of an attribute a template
 * offers, and what each one adds to its selling price.
 */
@storeService('ProductTemplateAttributeValueService', inventoryStore)
export class ProductTemplateAttributeValueService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: PRODUCT_TEMPLATE_ATTRIBUTE_VALUE_SCHEMA_NAME });
	}
}

export const productTemplateAttributeValueService = new ProductTemplateAttributeValueService();
