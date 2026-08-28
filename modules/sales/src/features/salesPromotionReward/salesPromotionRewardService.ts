import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


@storeService('SalesPromotionRewardService', salesStore)
export class SalesPromotionRewardService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_PROMOTION_REWARD_SCHEMA_NAME });
	}
}

export const salesPromotionRewardService = new SalesPromotionRewardService();
