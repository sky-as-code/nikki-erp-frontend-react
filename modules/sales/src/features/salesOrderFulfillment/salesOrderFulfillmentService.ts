import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * Read-only over HTTP: a fulfillment is created by confirming a kiosk order and moved by the
 * attempt and result actions, never by editing the row.
 */
@storeService('SalesOrderFulfillmentService', salesStore)
export class SalesOrderFulfillmentService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_ORDER_FULFILLMENT_SCHEMA_NAME });
	}
}

export const salesOrderFulfillmentService = new SalesOrderFulfillmentService();
