import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * Read-only over HTTP: allocations are written by splitting and merging, preserving the invariant
 * that every line's quantity is allocated exactly once across a bill set.
 */
@storeService('SalesBillLineService', salesStore)
export class SalesBillLineService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_BILL_LINE_SCHEMA_NAME });
	}
}

export const salesBillLineService = new SalesBillLineService();
