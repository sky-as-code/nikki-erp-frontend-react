import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { PURCHASE_ORDER_LINE_SCHEMA_NAME, PURCHASE_MODULE } from '../../constants';
import { purchaseStore } from '../../store';


/**
 * CRUD over `purchase_order_line`. The engine serves every operation this needs.
 *
 * A line has no page of its own: it is reached as a related record of the order that owns it.

 * Every write here recomputes the parent order's totals on the backend, inside the same
 * transaction ([PUR-014]), so nothing on this side needs to keep them in step.
 */
@storeService('PurchaseOrderLineService', purchaseStore)
export class PurchaseOrderLineService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: PURCHASE_MODULE, schemaName: PURCHASE_ORDER_LINE_SCHEMA_NAME });
	}
}

export const purchaseOrderLineService = new PurchaseOrderLineService();
