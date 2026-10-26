import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * `status` is `no_update` in the schema, so a PATCH cannot move it — send, cancel and convert are
 * the only ways it changes.
 */
@storeService('SalesQuotationService', salesStore)
export class SalesQuotationService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_QUOTATION_SCHEMA_NAME });
	}

	/**
	 * Conversion re-prices rather than copying the quoted numbers: the price explanation rebuilds a
	 * total from its adjustment chain, and a copied total has no chain. Holding a stale price
	 * deliberately is a manual discount instead. `sales_point_id` is supplied at conversion rather
	 * than taken from the quotation.
	 */
	public convert(request: ConvertQuotationRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.CONVERT_PATH);
	}

	public send(request: QuotationActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.SEND_PATH);
	}

	public cancel(request: QuotationActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.CANCEL_PATH);
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

export type QuotationActionRequest = {
	id: string,
	etag?: string,
};

/** `idempotency_key` stops a retried conversion creating a second order. */
export type ConvertQuotationRequest = QuotationActionRequest & {
	sales_point_id: string,
	idempotency_key?: string,
};

export const salesQuotationService = new SalesQuotationService();
