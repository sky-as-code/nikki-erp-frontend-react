import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * `combo_price` is independent and never derived from the components. Component allocation is an
 * output — how the price is spread for tax and returns — never an input to it.
 */
@storeService('SalesComboService', salesStore)
export class SalesComboService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_COMBO_SCHEMA_NAME });
	}
}

export const salesComboService = new SalesComboService();
