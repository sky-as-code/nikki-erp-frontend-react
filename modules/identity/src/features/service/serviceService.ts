import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { IAM_MODULE, SERVICE_SCHEMA_NAME } from '../../constants';
import { identityStore } from '../../store';


/** CRUD over `iam_service`; status changes are `update` calls carrying the new `status`, as for users. */
@storeService('ServiceService', identityStore)
export class ServiceService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: IAM_MODULE, schemaName: SERVICE_SCHEMA_NAME });
	}
}

export const serviceService = new ServiceService();
