import { ServiceResult } from '@nikkierp/common/commandBus';
import { CrudServiceBase } from '@nikkierp/common/service';

import * as t from './types';
import { IAM_MODULE, ROLE_SCHEMA_NAME } from '../../constants';


/** CRUD over `iam_role`, plus the entitlement many-to-many endpoint. */
export class RoleService extends CrudServiceBase {
	public constructor() {
		super({ moduleName: IAM_MODULE, schemaName: ROLE_SCHEMA_NAME });
	}

	public manageEntitlements(
		request: t.ManageRoleEntitlementsRequest,
	): Promise<ServiceResult<t.ManageRoleEntitlementsResponse>> {
		return this.manageM2m(request, 'manage-entitlements');
	}
}

export const roleService = new RoleService();
