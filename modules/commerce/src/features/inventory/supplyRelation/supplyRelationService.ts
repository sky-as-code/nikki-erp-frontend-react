import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, SUPPLY_RELATION_SCHEMA_NAME } from '../../../constants/inventory';
import { inventoryStore } from '../../../store/inventory';


/** CRUD over `inventory_warehouse_supply_relation`. Which warehouse may resupply which. Topology only: it starts no transfer. */
@storeService('SupplyRelationService', inventoryStore)
export class SupplyRelationService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: SUPPLY_RELATION_SCHEMA_NAME });
	}
}

export const supplyRelationService = new SupplyRelationService();
