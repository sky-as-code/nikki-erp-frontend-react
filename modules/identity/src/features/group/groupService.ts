import { ServiceResult } from '@nikkierp/common/commandBus';
import { StoreCrudServiceBase, storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import * as t from './types';
import { GROUP_SCHEMA_NAME, IAM_MODULE } from '../../constants';
import { identityStore } from '../../store';


/** CRUD over `iam_group`, plus the group-members many-to-many endpoint. */
@storeService('GroupService', identityStore)
export class GroupService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: IAM_MODULE, schemaName: GROUP_SCHEMA_NAME });
	}

	@storeAsyncMethod
	public manageUsers(request: t.ManageGroupUsersRequest): Promise<ServiceResult<t.ManageGroupUsersResponse>> {
		return this.manageM2m(request, 'manage-users');
	}
}

export const groupService = new GroupService();
