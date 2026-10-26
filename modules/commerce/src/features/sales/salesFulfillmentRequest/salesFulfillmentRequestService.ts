import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * Read-only over HTTP: a client able to POST one could tell Inventory to move goods no sale asked
 * for. `accepted` is not `completed` — only a completed request counts toward fulfilled quantity,
 * and money taken with goods not dispensed lives exactly between the two.
 */
@storeService('SalesFulfillmentRequestService', salesStore)
export class SalesFulfillmentRequestService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_FULFILLMENT_REQUEST_SCHEMA_NAME });
	}
}

export const salesFulfillmentRequestService = new SalesFulfillmentRequestService();
