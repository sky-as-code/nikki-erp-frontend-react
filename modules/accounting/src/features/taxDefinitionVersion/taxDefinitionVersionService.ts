import { storeService } from '@nikkierp/ui/appState/store';

import { OrgScopedCrudService } from '../../common/service/OrgScopedCrudService';
import { ACCOUNTING_MODULE, TAX_DEFINITION_VERSION_SCHEMA_NAME } from '../../constants';
import { accountingStore } from '../../store';


/**
 * CRUD over `accounting_tax_definition_version` — everything about a tax that decides an amount, for one effective period.
 *
 * Every operation comes from {@link OrgScopedCrudService}; the resource is served by the
 * backend's dynamic resource engine, so there is nothing resource-specific to add. Archiving is
 * the engine's `set_archived` action, reached through the generic command, not a method here.
 */
@storeService('TaxDefinitionVersionService', accountingStore)
export class TaxDefinitionVersionService extends OrgScopedCrudService {
	public constructor() {
		super({ moduleName: ACCOUNTING_MODULE, schemaName: TAX_DEFINITION_VERSION_SCHEMA_NAME });
	}
}

export const taxDefinitionVersionService = new TaxDefinitionVersionService();
