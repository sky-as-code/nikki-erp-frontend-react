import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * Read-only over HTTP. The row is where an item's warehouse reservation is recorded
 * (`inventory_reservation_ref`), which is how an operator gets from a sale to the stock held for it.
 */
@storeService('SalesOrderFulfillmentItemService', salesStore)
export class SalesOrderFulfillmentItemService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_ORDER_FULFILLMENT_ITEM_SCHEMA_NAME });
	}
}

export const salesOrderFulfillmentItemService = new SalesOrderFulfillmentItemService();
