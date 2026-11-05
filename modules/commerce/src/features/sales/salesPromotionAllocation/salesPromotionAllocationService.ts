import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../../constants/sales';
import { salesStore } from '../../../store/sales';


@storeService('SalesPromotionAllocationService', salesStore)
export class SalesPromotionAllocationService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_PROMOTION_ALLOCATION_SCHEMA_NAME });
	}
}

export const salesPromotionAllocationService = new SalesPromotionAllocationService();
