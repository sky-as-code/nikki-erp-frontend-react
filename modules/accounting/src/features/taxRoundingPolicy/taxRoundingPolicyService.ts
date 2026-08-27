import { storeService } from '@nikkierp/ui/appState/store';

import { OrgScopedCrudService } from '../../common/service/OrgScopedCrudService';
import { ACCOUNTING_MODULE, TAX_ROUNDING_POLICY_SCHEMA_NAME } from '../../constants';
import { accountingStore } from '../../store';


/**
 * CRUD over `accounting_tax_rounding_policy` — a rounding policy.
 *
 * Every operation comes from {@link OrgScopedCrudService}; the resource is served by the
 * backend's dynamic resource engine, so there is nothing resource-specific to add. Archiving is
 * the engine's `set_archived` action, reached through the generic command, not a method here.
 */
@storeService('TaxRoundingPolicyService', accountingStore)
export class TaxRoundingPolicyService extends OrgScopedCrudService {
	public constructor() {
		super({ moduleName: ACCOUNTING_MODULE, schemaName: TAX_ROUNDING_POLICY_SCHEMA_NAME });
	}
}

export const taxRoundingPolicyService = new TaxRoundingPolicyService();
