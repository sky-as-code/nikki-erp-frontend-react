import { ServiceResult } from '@nikkierp/common/commandBus';
import { StoreCrudServiceBase, storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import * as t from './types';
import { IAM_MODULE, ORGANIZATION_SCHEMA_NAME } from '../../constants';
import { identityStore } from '../../store';


/** CRUD over `iam_org`, plus slug lookup and the members action `iam_org/:id/manage_users`. */
@storeService('OrgService', identityStore)
export class OrgService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: IAM_MODULE, schemaName: ORGANIZATION_SCHEMA_NAME });
	}

	@storeAsyncMethod
	public getBySlug(request: t.GetOrgBySlugRequest): Promise<ServiceResult<t.GetOrgResponse>> {
		return this.getOne(request, req => new URLSearchParams({ slug: req.slug }));
	}

	@storeAsyncMethod
	public manageUsers(request: t.ManageOrgUsersRequest): Promise<ServiceResult<t.ManageOrgUsersResponse>> {
		const { id, ...body } = request;
		return this.manageM2m(body, `${encodeURIComponent(id)}/manage_users`);
	}
}

export const orgService = new OrgService();
