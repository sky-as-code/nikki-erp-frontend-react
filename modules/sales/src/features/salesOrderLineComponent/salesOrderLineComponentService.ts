import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * Read-only over HTTP: rows are written by combo expansion, and a hand-made one would claim a combo
 * contained something it does not. The IAM seed grants `read` alone, so a write returns 403, not 404.
 */
@storeService('SalesOrderLineComponentService', salesStore)
export class SalesOrderLineComponentService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_ORDER_LINE_COMPONENT_SCHEMA_NAME });
	}
}

export const salesOrderLineComponentService = new SalesOrderLineComponentService();
