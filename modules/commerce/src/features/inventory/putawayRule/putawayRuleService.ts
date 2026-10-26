import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, PUTAWAY_RULE_SCHEMA_NAME } from '../../constants';
import { inventoryStore } from '../../store';


/** CRUD over `inventory_putaway_rule`. Where arriving goods should be put. It answers the question and moves nothing. */
@storeService('PutawayRuleService', inventoryStore)
export class PutawayRuleService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: PUTAWAY_RULE_SCHEMA_NAME });
	}
}

export const putawayRuleService = new PutawayRuleService();
