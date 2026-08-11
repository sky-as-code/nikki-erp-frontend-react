import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, PRODUCT_TYPE_SCHEMA_NAME } from '../../constants';
import { inventoryStore } from '../../store';


/** CRUD over `inventory_product_type`. The engine serves every operation this needs. */
@storeService('ProductTypeService', inventoryStore)
export class ProductTypeService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: PRODUCT_TYPE_SCHEMA_NAME });
	}
}

export const productTypeService = new ProductTypeService();
