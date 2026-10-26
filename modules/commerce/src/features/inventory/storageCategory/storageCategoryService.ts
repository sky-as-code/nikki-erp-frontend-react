import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, STORAGE_CATEGORY_SCHEMA_NAME } from '../../constants';
import { inventoryStore } from '../../store';


/** CRUD over `inventory_storage_category`. Capacity and mixing policy a location may carry. */
@storeService('StorageCategoryService', inventoryStore)
export class StorageCategoryService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: STORAGE_CATEGORY_SCHEMA_NAME });
	}
}

export const storageCategoryService = new StorageCategoryService();
