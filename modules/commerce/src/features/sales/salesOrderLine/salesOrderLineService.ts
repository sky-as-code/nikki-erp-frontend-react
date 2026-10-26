import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * Adding, changing and removing a line are plain writes here, not actions on the order — there is
 * no `add_line` action. Call the order's `reprice` afterwards; it is deliberately not automatic so
 * that adding three lines costs one repricing rather than three.
 */
@storeService('SalesOrderLineService', salesStore)
export class SalesOrderLineService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_ORDER_LINE_SCHEMA_NAME });
	}
}

export const salesOrderLineService = new SalesOrderLineService();
