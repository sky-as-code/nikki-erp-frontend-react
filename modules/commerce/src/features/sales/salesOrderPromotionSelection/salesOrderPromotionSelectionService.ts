import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../../constants/sales';
import { salesStore } from '../../../store/sales';


@storeService('SalesOrderPromotionSelectionService', salesStore)
export class SalesOrderPromotionSelectionService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_ORDER_PROMOTION_SELECTION_SCHEMA_NAME });
	}
}

export const salesOrderPromotionSelectionService = new SalesOrderPromotionSelectionService();
