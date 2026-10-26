import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


@storeService('SalesPricelistItemService', salesStore)
export class SalesPricelistItemService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_PRICELIST_ITEM_SCHEMA_NAME });
	}
}

export const salesPricelistItemService = new SalesPricelistItemService();
