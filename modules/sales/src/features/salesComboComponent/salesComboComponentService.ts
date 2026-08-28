import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


@storeService('SalesComboComponentService', salesStore)
export class SalesComboComponentService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_COMBO_COMPONENT_SCHEMA_NAME });
	}
}

export const salesComboComponentService = new SalesComboComponentService();
