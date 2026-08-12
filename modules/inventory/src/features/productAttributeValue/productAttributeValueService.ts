import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, PRODUCT_ATTRIBUTE_VALUE_SCHEMA_NAME } from '../../constants';
import { inventoryStore } from '../../store';


/** CRUD over `inventory_product_attribute_value`. The engine serves every operation this needs. */
@storeService('ProductAttributeValueService', inventoryStore)
export class ProductAttributeValueService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: PRODUCT_ATTRIBUTE_VALUE_SCHEMA_NAME });
	}
}

export const productAttributeValueService = new ProductAttributeValueService();
