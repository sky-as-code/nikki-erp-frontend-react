import { ServiceResult } from '@nikkierp/common/commandBus';
import { CrudServiceBase } from '@nikkierp/common/service';

import * as t from './types';
import { GROUP_SCHEMA_NAME, IAM_MODULE } from '../../constants';


/** CRUD over `iam_group`, plus the group-members many-to-many endpoint. */
export class GroupService extends CrudServiceBase {
	public constructor() {
		super({ moduleName: IAM_MODULE, schemaName: GROUP_SCHEMA_NAME });
	}

	public manageUsers(request: t.ManageGroupUsersRequest): Promise<ServiceResult<t.ManageGroupUsersResponse>> {
		return this.manageM2m(request, 'manage-users');
	}
}

export const groupService = new GroupService();
