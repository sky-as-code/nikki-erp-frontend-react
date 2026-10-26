import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/** Read-only over HTTP: an audit trail a client can write is not one. */
@storeService('SalesOrderEventService', salesStore)
export class SalesOrderEventService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_ORDER_EVENT_SCHEMA_NAME });
	}
}

export const salesOrderEventService = new SalesOrderEventService();
