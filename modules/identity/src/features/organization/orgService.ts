import { ServiceResult } from '@nikkierp/common/commandBus';
import { CrudServiceBase } from '@nikkierp/common/service';

import * as t from './types';
import { IAM_MODULE, ORGANIZATION_SCHEMA_NAME } from '../../constants';


/** CRUD over `iam_organization`, plus slug lookup and the members many-to-many endpoint. */
export class OrgService extends CrudServiceBase {
	public constructor() {
		super({ moduleName: IAM_MODULE, schemaName: ORGANIZATION_SCHEMA_NAME });
	}

	public getBySlug(request: t.GetOrgBySlugRequest): Promise<ServiceResult<t.GetOrgResponse>> {
		return this.getOne(request, req => new URLSearchParams({ slug: req.slug }));
	}

	public manageUsers(request: t.ManageOrgUsersRequest): Promise<ServiceResult<t.ManageOrgUsersResponse>> {
		return this.manageM2m(request, 'manage-users');
	}
}

export const orgService = new OrgService();
