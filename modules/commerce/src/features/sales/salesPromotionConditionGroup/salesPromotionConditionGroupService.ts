import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../../constants/sales';
import { salesStore } from '../../../store/sales';


@storeService('SalesPromotionConditionGroupService', salesStore)
export class SalesPromotionConditionGroupService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_PROMOTION_CONDITION_GROUP_SCHEMA_NAME });
	}
}

export const salesPromotionConditionGroupService = new SalesPromotionConditionGroupService();
