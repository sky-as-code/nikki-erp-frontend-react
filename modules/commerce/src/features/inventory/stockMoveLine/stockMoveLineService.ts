import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, STOCK_MOVE_LINE_SCHEMA_NAME } from '../../constants';
import { inventoryStore } from '../../store';


/** CRUD over `inventory_stock_move_line`. The engine serves every operation this needs. */
@storeService('StockMoveLineService', inventoryStore)
export class StockMoveLineService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: STOCK_MOVE_LINE_SCHEMA_NAME });
	}
}

export const stockMoveLineService = new StockMoveLineService();
