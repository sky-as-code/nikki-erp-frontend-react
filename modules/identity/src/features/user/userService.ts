import { CrudServiceBase } from '@nikkierp/common/service';

import { IAM_MODULE, USER_SCHEMA_NAME } from '../../constants';


/**
 * CRUD over `iam_user`.
 *
 * Every operation comes from {@link CrudServiceBase}; the user resource needs no
 * behaviour beyond it. Status changes (activate / invite / suspend) are ordinary
 * `update` calls carrying the new `status`, so they get no dedicated method.
 */
export class UserService extends CrudServiceBase {
	public constructor() {
		super({ moduleName: IAM_MODULE, schemaName: USER_SCHEMA_NAME });
	}
}

export const userService = new UserService();
