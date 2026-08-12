import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, STOCK_QUANT_SCHEMA_NAME } from '../../constants';
import { inventoryStore } from '../../store';


/**
 * Reads over `inventory_stock_quant`.
 *
 * The base class supplies the write operations too, but the backend engine refuses create, update
 * and delete on this resource: a balance is the running total of completed movements, not
 * something a client sets. They are left inherited rather than overridden to throw, because the
 * server is the single authority on that rule and a second copy of it here could drift. The stock
 * balance page simply offers no write action. See BR §3.3 and AC-STOCK-002.
 */
@storeService('StockQuantService', inventoryStore)
export class StockQuantService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: STOCK_QUANT_SCHEMA_NAME });
	}
}

export const stockQuantService = new StockQuantService();
