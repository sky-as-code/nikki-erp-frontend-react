import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, PRODUCT_CATEGORY_SCHEMA_NAME } from '../../constants';
import { inventoryStore } from '../../store';


/** CRUD over `inventory_product_category`. The engine serves every operation this needs. */
@storeService('ProductCategoryService', inventoryStore)
export class ProductCategoryService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: PRODUCT_CATEGORY_SCHEMA_NAME });
	}
}

export const productCategoryService = new ProductCategoryService();
