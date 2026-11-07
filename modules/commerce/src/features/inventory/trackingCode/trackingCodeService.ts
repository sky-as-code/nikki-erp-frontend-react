import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { TRACKING_CODE_SCHEMA_NAME, INVENTORY_MODULE } from '../../../constants/inventory';
import { inventoryStore } from '../../../store/inventory';


/** CRUD over `inventory_tracking_code`: the lot and serial number master. */
@storeService('TrackingCodeService', inventoryStore)
export class TrackingCodeService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: TRACKING_CODE_SCHEMA_NAME });
	}
}

export const trackingCodeService = new TrackingCodeService();
