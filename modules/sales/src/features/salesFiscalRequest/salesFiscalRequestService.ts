import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * Create-and-read only: no update, delete or archive, because a fiscal document is a statement to
 * the tax authority. The row is written before the provider is called — call-then-store would lose
 * the document on a timeout after the provider issued it, and the next attempt would issue a
 * second invoice against the same sale.
 */
@storeService('SalesFiscalRequestService', salesStore)
export class SalesFiscalRequestService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_FISCAL_REQUEST_SCHEMA_NAME });
	}

	/**
	 * Hangs off the fiscal request resource, not the bill, so requesting an invoice does not imply
	 * permission to alter what is owed. `idempotency_key` travels to the provider, so a retry must
	 * resend the same key it sent the first time; omitting it generates a fresh one and issues a
	 * duplicate. `intent` defaults to `ISSUE_ORIGINAL`; every other intent requires
	 * `original_fiscal_request_id`.
	 */
	public requestInvoice(
		request: RequestInvoiceRequest,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.REQUEST_INVOICE_PATH);
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

/**
 * Nested rather than flattened, matching the backend shape, and snapshotted onto the request: a
 * later correction to the customer record must not restate an already-issued invoice.
 */
export type FiscalBuyer = {
	tax_code?: string,
	legal_name?: string,
	address?: string,
	email?: string,
};

export type RequestInvoiceRequest = {
	sales_bill_id: string,
	intent?: string,
	original_fiscal_request_id?: string,
	reason?: string,
	idempotency_key?: string,
	buyer?: FiscalBuyer,
};

export const salesFiscalRequestService = new SalesFiscalRequestService();
