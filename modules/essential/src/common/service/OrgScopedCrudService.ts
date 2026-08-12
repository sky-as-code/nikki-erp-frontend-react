import { StoreCrudServiceBase, storeAsyncMethod } from '@nikkierp/ui/appState/store';

import { withOrgId } from '../orgContext';

import type { ServiceResult } from '@nikkierp/common/commandBus';
import type * as dyn from '@nikkierp/common/dynamicModel';


/**
 * `StoreCrudServiceBase` for resources the backend scopes to an organization.
 *
 * Both UoM resources declare `org_id` as required, and the engine's search binds it
 * unconditionally, so a request without it matches **no** rows. Acquiring it here rather than at
 * each call site means a new page cannot forget it and silently render an empty list.
 *
 * Reads only. Writes take the org from the record being written — `create` carries an explicit
 * `org_id` field, and `update`/`delete` are addressed by an id the server already scopes.
 */
export abstract class OrgScopedCrudService extends StoreCrudServiceBase {
	@storeAsyncMethod
	public override async search(
		request: dyn.RestSearchRequest, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestSearchResponse<any>>> {
		return super.search(await withOrgId(request), primaryResourceId);
	}

	@storeAsyncMethod
	public override async getById(
		request: dyn.RestGetByIdRequest, primaryResourceId?: string,
	): Promise<ServiceResult<dyn.RestGetOneResponse<any>>> {
		return super.getById(await withOrgId(request), primaryResourceId);
	}
}
