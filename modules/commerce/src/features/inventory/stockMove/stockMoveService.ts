import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, STOCK_MOVE_SCHEMA_NAME } from '../../../constants/inventory';
import { inventoryStore } from '../../../store/inventory';


/** CRUD over `inventory_stock_move`. The engine serves every operation this needs. */
@storeService('StockMoveService', inventoryStore)
export class StockMoveService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: STOCK_MOVE_SCHEMA_NAME });
	}
}

export const stockMoveService = new StockMoveService();
