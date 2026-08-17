import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, INVENTORY_LOCATION_SCHEMA_NAME } from '../../constants';
import { inventoryStore } from '../../store';


/** CRUD over `inventory_location`. The engine serves every operation this needs. */
@storeService('InventoryLocationService', inventoryStore)
export class InventoryLocationService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: INVENTORY_LOCATION_SCHEMA_NAME });
	}
}

export const inventoryLocationService = new InventoryLocationService();
