import { storeService } from '@nikkierp/ui/appState/store';

import { OrgScopedCrudService } from '../../common/service/OrgScopedCrudService';
import { ACCOUNTING_MODULE, TAX_RULE_CONDITION_SCHEMA_NAME } from '../../constants';
import { accountingStore } from '../../store';


/**
 * CRUD over `accounting_tax_rule_condition` — one typed predicate on the tax context.
 *
 * Every operation comes from {@link OrgScopedCrudService}; the resource is served by the
 * backend's dynamic resource engine, so there is nothing resource-specific to add. Archiving is
 * the engine's `set_archived` action, reached through the generic command, not a method here.
 */
@storeService('TaxRuleConditionService', accountingStore)
export class TaxRuleConditionService extends OrgScopedCrudService {
	public constructor() {
		super({ moduleName: ACCOUNTING_MODULE, schemaName: TAX_RULE_CONDITION_SCHEMA_NAME });
	}
}

export const taxRuleConditionService = new TaxRuleConditionService();
