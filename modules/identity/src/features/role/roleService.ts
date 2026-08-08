import { ServiceResult } from '@nikkierp/common/commandBus';
import { StoreCrudServiceBase, storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import * as t from './types';
import { IAM_MODULE, ROLE_SCHEMA_NAME } from '../../constants';
import { identityStore } from '../../store';


/** CRUD over `iam_role`, plus the entitlement many-to-many endpoint. */
@storeService('RoleService', identityStore)
export class RoleService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: IAM_MODULE, schemaName: ROLE_SCHEMA_NAME });
	}

	@storeAsyncMethod
	public manageEntitlements(
		request: t.ManageRoleEntitlementsRequest,
	): Promise<ServiceResult<t.ManageRoleEntitlementsResponse>> {
		return this.manageM2m(request, 'manage-entitlements');
	}
}

export const roleService = new RoleService();
