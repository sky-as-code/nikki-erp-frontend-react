import { ServiceResult } from '@nikkierp/common/commandBus';
import { StoreCrudServiceBase, storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import * as t from './types';
import { GROUP_SCHEMA_NAME, IAM_MODULE } from '../../constants';
import { identityStore } from '../../store';


/** CRUD over `iam_group`, plus the members action `iam_group/:id/manage_users`. */
@storeService('GroupService', identityStore)
export class GroupService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: IAM_MODULE, schemaName: GROUP_SCHEMA_NAME });
	}

	@storeAsyncMethod
	public manageUsers(request: t.ManageGroupUsersRequest): Promise<ServiceResult<t.ManageGroupUsersResponse>> {
		const { id, ...body } = request;
		return this.manageM2m(body, `${encodeURIComponent(id)}/manage_users`);
	}
}

export const groupService = new GroupService();
