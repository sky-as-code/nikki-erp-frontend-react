import { ServiceResult } from '@nikkierp/common/commandBus';
import { StoreCrudServiceBase, storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import * as t from './types';
import { IAM_MODULE, ROLE_SCHEMA_NAME } from '../../constants';
import { identityStore } from '../../store';


export type RolePrincipalsAction = 'manage-users' | 'manage-groups';

/**
 * `manageM2m` appends its path to the schema's base path (`v1/iam/roles`), so the role id goes into
 * the path: the routes are `roles/:role_id/manage-*`, not `roles/manage-*`. Empty lists are dropped
 * so a remove-only call sends no `add`.
 */
export function toManagePrincipalsCall(request: t.ManageRolePrincipalsRequest, action: RolePrincipalsAction) {
	const body: { add?: string[], remove?: string[] } = {};
	if (request.add?.length) {
		body.add = request.add;
	}
	if (request.remove?.length) {
		body.remove = request.remove;
	}
	return { path: `${encodeURIComponent(request.id)}/${action}`, body };
}

/** CRUD over `iam_role`, plus its many-to-many endpoints (users, groups). */
@storeService('RoleService', identityStore)
export class RoleService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: IAM_MODULE, schemaName: ROLE_SCHEMA_NAME });
	}

	@storeAsyncMethod
	public manageUsers(
		request: t.ManageRolePrincipalsRequest,
	): Promise<ServiceResult<t.ManageRolePrincipalsResponse>> {
		return this.managePrincipals(request, 'manage-users');
	}

	@storeAsyncMethod
	public manageGroups(
		request: t.ManageRolePrincipalsRequest,
	): Promise<ServiceResult<t.ManageRolePrincipalsResponse>> {
		return this.managePrincipals(request, 'manage-groups');
	}

	private managePrincipals(
		request: t.ManageRolePrincipalsRequest, action: RolePrincipalsAction,
	): Promise<ServiceResult<t.ManageRolePrincipalsResponse>> {
		const { path, body } = toManagePrincipalsCall(request, action);
		return this.manageM2m(body, path);
	}
}

export const roleService = new RoleService();
