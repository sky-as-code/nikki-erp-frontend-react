import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../../constants/sales';
import { salesStore } from '../../../store/sales';


@storeService('SalesPromotionRewardCategoryService', salesStore)
export class SalesPromotionRewardCategoryService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_PROMOTION_REWARD_CATEGORY_SCHEMA_NAME });
	}
}

export const salesPromotionRewardCategoryService = new SalesPromotionRewardCategoryService();
