import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { BRAND_SCHEMA_NAME, INVENTORY_MODULE } from '../../constants';
import { inventoryStore } from '../../store';


/** CRUD over `inventory_brand`. The engine serves every operation this needs. */
@storeService('BrandService', inventoryStore)
export class BrandService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: BRAND_SCHEMA_NAME });
	}
}

export const brandService = new BrandService();
