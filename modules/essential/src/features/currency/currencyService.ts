import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { CURRENCY_SCHEMA_NAME, ESSENTIAL_MODULE } from '../../constants';
import { essentialStore } from '../../store';


/**
 * CRUD over `essential_currency`, the tenant-wide currency catalogue. `decimal_places` is derived by
 * the backend from `rounding` (Odoo's rule), so a form shows it read-only and never sends it.
 */
@storeService('CurrencyService', essentialStore)
export class CurrencyService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: ESSENTIAL_MODULE, schemaName: CURRENCY_SCHEMA_NAME });
	}
}

export const currencyService = new CurrencyService();
