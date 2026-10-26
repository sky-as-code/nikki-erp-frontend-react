import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, PRODUCT_TEMPLATE_ATTRIBUTE_SCHEMA_NAME } from '../../../constants/inventory';
import { inventoryStore } from '../../../store/inventory';


/** CRUD over `inventory_product_template_attribute`, the template-to-attribute junction. */
@storeService('ProductTemplateAttributeService', inventoryStore)
export class ProductTemplateAttributeService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: PRODUCT_TEMPLATE_ATTRIBUTE_SCHEMA_NAME });
	}
}

export const productTemplateAttributeService = new ProductTemplateAttributeService();
