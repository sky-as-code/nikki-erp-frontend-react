import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { ACCOUNTING_MODULE, TAX_JURISDICTION_SCHEMA_NAME } from '../../constants';
import { accountingStore } from '../../store';


/**
 * CRUD over `accounting_tax_jurisdiction` — a taxing territory.
 *
 * Every operation comes from {@link StoreCrudServiceBase}; the resource is served by the
 * backend's dynamic resource engine, so there is nothing resource-specific to add. Archiving is
 * the engine's `set_archived` action, reached through the generic command, not a method here.
 */
@storeService('TaxJurisdictionService', accountingStore)
export class TaxJurisdictionService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: ACCOUNTING_MODULE, schemaName: TAX_JURISDICTION_SCHEMA_NAME });
	}
}

export const taxJurisdictionService = new TaxJurisdictionService();
