import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * Read-only over HTTP: a writable lineage row could fabricate a payment trail between bills that
 * were never related.
 */
@storeService('SalesBillRelationService', salesStore)
export class SalesBillRelationService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_BILL_RELATION_SCHEMA_NAME });
	}
}

export const salesBillRelationService = new SalesBillRelationService();
