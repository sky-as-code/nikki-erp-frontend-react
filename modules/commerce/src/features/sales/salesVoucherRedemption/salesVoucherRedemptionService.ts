import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * Read-only over HTTP: redemption enforces a voucher's usage limit, so a client able to write one
 * could hand itself unlimited use of a single-use code.
 */
@storeService('SalesVoucherRedemptionService', salesStore)
export class SalesVoucherRedemptionService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_VOUCHER_REDEMPTION_SCHEMA_NAME });
	}
}

export const salesVoucherRedemptionService = new SalesVoucherRedemptionService();
