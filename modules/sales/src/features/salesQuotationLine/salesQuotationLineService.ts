import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


@storeService('SalesQuotationLineService', salesStore)
export class SalesQuotationLineService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_QUOTATION_LINE_SCHEMA_NAME });
	}
}

export const salesQuotationLineService = new SalesQuotationLineService();
