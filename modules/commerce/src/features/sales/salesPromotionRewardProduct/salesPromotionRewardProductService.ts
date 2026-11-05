import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../../constants/sales';
import { salesStore } from '../../../store/sales';


@storeService('SalesPromotionRewardProductService', salesStore)
export class SalesPromotionRewardProductService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_PROMOTION_REWARD_PRODUCT_SCHEMA_NAME });
	}
}

export const salesPromotionRewardProductService = new SalesPromotionRewardProductService();
