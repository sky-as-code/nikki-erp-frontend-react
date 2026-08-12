import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, STOCK_LOCATION_SCHEMA_NAME } from '../../constants';
import { inventoryStore } from '../../store';


/** CRUD over `inventory_stock_location`. The engine serves every operation this needs. */
@storeService('StockLocationService', inventoryStore)
export class StockLocationService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: STOCK_LOCATION_SCHEMA_NAME });
	}
}

export const stockLocationService = new StockLocationService();
