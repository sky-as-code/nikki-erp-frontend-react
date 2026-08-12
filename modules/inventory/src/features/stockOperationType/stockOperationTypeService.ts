import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, STOCK_OPERATION_TYPE_SCHEMA_NAME } from '../../constants';
import { inventoryStore } from '../../store';


/** CRUD over `inventory_stock_operation_type`. The engine serves every operation this needs. */
@storeService('StockOperationTypeService', inventoryStore)
export class StockOperationTypeService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: STOCK_OPERATION_TYPE_SCHEMA_NAME });
	}
}

export const stockOperationTypeService = new StockOperationTypeService();
