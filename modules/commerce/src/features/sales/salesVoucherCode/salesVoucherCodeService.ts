import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * `usage_count` is maintained by redemption, not written here: the limit is enforced by a
 * conditional update that fails once the count is reached, which is what makes a single-use code
 * single-use under concurrency.
 */
@storeService('SalesVoucherCodeService', salesStore)
export class SalesVoucherCodeService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_VOUCHER_CODE_SCHEMA_NAME });
	}
}

export const salesVoucherCodeService = new SalesVoucherCodeService();
