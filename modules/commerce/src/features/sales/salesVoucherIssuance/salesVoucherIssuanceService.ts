import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../../constants/sales';
import { salesStore } from '../../../store/sales';


@storeService('SalesVoucherIssuanceService', salesStore)
export class SalesVoucherIssuanceService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_VOUCHER_ISSUANCE_SCHEMA_NAME });
	}
}

export const salesVoucherIssuanceService = new SalesVoucherIssuanceService();
