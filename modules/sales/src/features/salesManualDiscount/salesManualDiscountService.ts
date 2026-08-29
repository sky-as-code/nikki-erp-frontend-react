import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * Read-only over HTTP: granting and revoking go through the order's own actions, which take the
 * authoriser from the request context. A writable row would let a caller name somebody else as
 * having approved the discount.
 */
@storeService('SalesManualDiscountService', salesStore)
export class SalesManualDiscountService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_MANUAL_DISCOUNT_SCHEMA_NAME });
	}
}

export const salesManualDiscountService = new SalesManualDiscountService();
