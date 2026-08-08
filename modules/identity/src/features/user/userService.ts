import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { IAM_MODULE, USER_SCHEMA_NAME } from '../../constants';
import { identityStore } from '../../store';


/**
 * CRUD over `iam_user`.
 *
 * Every operation comes from {@link CrudServiceBase}; the user resource needs no
 * behaviour beyond it. Status changes (activate / invite / suspend) are ordinary
 * `update` calls carrying the new `status`, so they get no dedicated method.
 */
@storeService('UserService', identityStore)
export class UserService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: IAM_MODULE, schemaName: USER_SCHEMA_NAME });
	}
}

export const userService = new UserService();
