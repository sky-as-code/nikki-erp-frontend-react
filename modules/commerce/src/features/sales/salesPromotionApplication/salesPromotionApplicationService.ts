import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../../constants/sales';
import { salesStore } from '../../../store/sales';


@storeService('SalesPromotionApplicationService', salesStore)
export class SalesPromotionApplicationService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_PROMOTION_APPLICATION_SCHEMA_NAME });
	}
}

export const salesPromotionApplicationService = new SalesPromotionApplicationService();
