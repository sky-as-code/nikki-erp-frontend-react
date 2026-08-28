import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * Money moves through `pay`, never through a write on `sales_payment` — that resource is read-only
 * over HTTP so a payment cannot be recorded without the gates the action applies.
 */
@storeService('SalesBillService', salesStore)
export class SalesBillService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_BILL_SCHEMA_NAME });
	}

	/**
	 * `allocations` maps order line id to quantity; the backend checks completeness in both
	 * directions, since under-allocating leaves value unbilled and over-allocating bills twice.
	 * A split is not a pricing event — promotions are never re-evaluated.
	 */
	public split(request: SplitBillRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.SPLIT_PATH);
	}

	/**
	 * The backend picks the target bill and rejects the whole merge rather than merging partially.
	 * Totals are summed, not re-allocated — re-rounding balanced figures could lose a dong.
	 */
	public merge(request: MergeBillsRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.MERGE_PATH);
	}

	/**
	 * The method must be both mapped to the bill's channel and currently usable; usability depends
	 * on the running build's gateway registry, so a local mapping is no proof of it.
	 * `external_transaction_id` is what makes a retry safe — cash carries none, so a double-tap
	 * records twice. `status` defaults to `captured`; only captured money counts toward
	 * settlement, since an authorization is a hold the provider may still release.
	 */
	public pay(request: RecordPaymentRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.PAY_PATH);
	}

	/** Settlement is exact equality with no tolerance: a bill a fraction short is not paid. */
	public settle(request: BillActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.SETTLE_PATH);
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

export type BillActionRequest = {
	id: string,
	etag?: string,
};

export type SplitBillPart = {
	allocations: Record<string, string>,
};

export type SplitBillRequest = BillActionRequest & {
	parts: SplitBillPart[],
};

/** At least two ids; the backend chooses the target among them. */
export type MergeBillsRequest = {
	source_bill_ids: string[],
};

export type RecordPaymentRequest = BillActionRequest & {
	payment_method_id: string,
	amount: string,
	currency_code: string,
	external_transaction_id?: string,
	provider_reference?: string,
	status?: string,
};

export const salesBillService = new SalesBillService();
