import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, PRODUCT_ATTRIBUTE_SCHEMA_NAME } from '../../constants';
import { inventoryStore } from '../../store';


/** CRUD over `inventory_product_attribute`. The engine serves every operation this needs. */
@storeService('ProductAttributeService', inventoryStore)
export class ProductAttributeService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: PRODUCT_ATTRIBUTE_SCHEMA_NAME });
	}
}

export const productAttributeService = new ProductAttributeService();
