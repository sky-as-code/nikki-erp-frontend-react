import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../../constants/sales';
import { salesStore } from '../../../store/sales';


@storeService('SalesPromotionRuleCategoryService', salesStore)
export class SalesPromotionRuleCategoryService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_PROMOTION_RULE_CATEGORY_SCHEMA_NAME });
	}
}

export const salesPromotionRuleCategoryService = new SalesPromotionRuleCategoryService();
