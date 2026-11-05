import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../../constants/sales';
import { salesStore } from '../../../store/sales';


@storeService('SalesPromotionRuleProductService', salesStore)
export class SalesPromotionRuleProductService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_PROMOTION_RULE_PRODUCT_SCHEMA_NAME });
	}
}

export const salesPromotionRuleProductService = new SalesPromotionRuleProductService();
