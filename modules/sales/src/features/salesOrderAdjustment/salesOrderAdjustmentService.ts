import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * Read-only over HTTP: the pricing engine replaces the whole chain on every repricing, so a
 * hand-written row is silently erased the next time anything touches the order, having meanwhile
 * shown the customer a discount they were never given.
 */
@storeService('SalesOrderAdjustmentService', salesStore)
export class SalesOrderAdjustmentService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_ORDER_ADJUSTMENT_SCHEMA_NAME });
	}
}

export const salesOrderAdjustmentService = new SalesOrderAdjustmentService();
