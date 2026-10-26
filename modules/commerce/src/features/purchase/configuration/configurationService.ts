import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { CONFIGURATION_SCHEMA_NAME, PURCHASE_MODULE } from '../../constants';
import { purchaseStore } from '../../store';


/**
 * CRUD over `purchase_configuration`. The engine serves every operation this needs.
 *
 * One record per organization, holding the approval mode and its threshold. It is read on every
 * order confirmation to decide whether approval is required, so it is configuration rather than
 * a document.
 */
@storeService('ConfigurationService', purchaseStore)
export class ConfigurationService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: PURCHASE_MODULE, schemaName: CONFIGURATION_SCHEMA_NAME });
	}
}

export const configurationService = new ConfigurationService();
