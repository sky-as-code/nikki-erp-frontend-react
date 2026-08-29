import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * A pricelist is scoped to a channel, a point, or neither, and specificity beats priority: a
 * point-scoped list wins over a channel-scoped one whatever their priorities say.
 */
@storeService('SalesPricelistService', salesStore)
export class SalesPricelistService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_PRICELIST_SCHEMA_NAME });
	}

	/**
	 * An action rather than a PATCH on `is_default` because the flag must move off whichever list
	 * holds it; two defaults is a state the resolver cannot choose between.
	 */
	public setDefault(request: PricelistActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.SET_DEFAULT_PATH);
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

export type PricelistActionRequest = {
	id: string,
	etag?: string,
};

export const salesPricelistService = new SalesPricelistService();
