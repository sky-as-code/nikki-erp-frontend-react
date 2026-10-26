import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, STOCK_PRODUCT_CONFIG_SCHEMA_NAME } from '../../constants';
import { inventoryStore } from '../../store';


/**
 * CRUD over `inventory_stock_product_config`: Stock's settings for a product line, currently the
 * unit its balances are counted in.
 *
 * The unit is not a field of the product template. What a balance means belongs to Stock, and the
 * template is Product master data — putting it there would make Product the owner of a stock
 * concept. One row per template; every variant inherits it and none may override it.
 *
 * The server refuses a change of unit once the product has stock or stock history, since that
 * would reinterpret every quantity ever recorded against it. Nothing is restated here: the rule
 * has one home, and a copy in the client could only drift from it.
 */
@storeService('StockProductConfigService', inventoryStore)
export class StockProductConfigService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: STOCK_PRODUCT_CONFIG_SCHEMA_NAME });
	}
}

export const stockProductConfigService = new StockProductConfigService();
