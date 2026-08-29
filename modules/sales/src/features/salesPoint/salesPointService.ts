import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * A point is a till, kiosk or counter. `sales_channel_id` is immutable once set: every order rung
 * up here records that channel, so moving a point between channels rewrites the provenance of
 * sales already made. Unlike a channel, a point can be unarchived.
 */
@storeService('SalesPointService', salesStore)
export class SalesPointService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_POINT_SCHEMA_NAME });
	}

	/** No new sales; what it already sold is untouched. */
	public suspend(request: PointActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.SUSPEND_PATH);
	}

	public activate(request: PointActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.ACTIVATE_PATH);
	}

	/** Leaves what was sold through the point intact. */
	public archive(request: PointActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.ARCHIVE_PATH);
	}

	public unarchive(request: PointActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.UNARCHIVE_PATH);
	}

	private postAction(
		request: Record<string, unknown>, action: string,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		// The id goes into the sub-path: manageM2m's primaryResourceId only applies to a
		// resource nested under a parent, so for a top-level resource it is ignored and the
		// post lands on {resource}/{action} with no id - which the backend answers 405.
		const id = request.id as string | undefined;
		const path = id ? `${id}/${action}` : action;
		return this.manageM2m(request as dyn.RestManageM2mRequest, path);
	}
}

export type PointActionRequest = {
	id: string,
	etag?: string,
};

export const salesPointService = new SalesPointService();
