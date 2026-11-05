import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../../constants/sales';
import { salesStore } from '../../../store/sales';


@storeService('SalesOrderVoucherService', salesStore)
export class SalesOrderVoucherService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_ORDER_VOUCHER_SCHEMA_NAME });
	}
}

export const salesOrderVoucherService = new SalesOrderVoucherService();
