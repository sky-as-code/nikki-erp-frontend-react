import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/** Read-only over HTTP, like the fulfilment request itself. */
@storeService('SalesFulfillmentRequestLineService', salesStore)
export class SalesFulfillmentRequestLineService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_FULFILLMENT_REQUEST_LINE_SCHEMA_NAME });
	}
}

export const salesFulfillmentRequestLineService = new SalesFulfillmentRequestLineService();
