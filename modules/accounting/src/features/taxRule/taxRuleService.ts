import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { ACCOUNTING_MODULE, TAX_RULE_SCHEMA_NAME } from '../../constants';
import { accountingStore } from '../../store';


/**
 * CRUD over `accounting_tax_rule` — a rule deciding which taxes apply.
 *
 * Every operation comes from {@link StoreCrudServiceBase}; the resource is served by the
 * backend's dynamic resource engine, so there is nothing resource-specific to add. Archiving is
 * the engine's `set_archived` action, reached through the generic command, not a method here.
 */
@storeService('TaxRuleService', accountingStore)
export class TaxRuleService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: ACCOUNTING_MODULE, schemaName: TAX_RULE_SCHEMA_NAME });
	}
}

export const taxRuleService = new TaxRuleService();
