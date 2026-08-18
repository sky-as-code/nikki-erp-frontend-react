import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVOICE_SCHEMA_NAME, PAYMENTINVOICE_MODULE } from '../../constants';
import { paymentInvoiceStore } from '../../store';


/**
 * CRUD over `paymentinvoice_invoice`, plus the issue action.
 *
 * Issuing is not an update. It recomputes the totals from the lines, assigns the number from a
 * per-year sequence and stamps the date — and it is irreversible, because an issued invoice is an
 * accounting document. The backend gives it its own permission for that reason: being allowed to
 * correct a draft's note is not the same authority as being allowed to close one.
 */
@storeService('InvoiceService', paymentInvoiceStore)
export class InvoiceService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: PAYMENTINVOICE_MODULE, schemaName: INVOICE_SCHEMA_NAME });
	}

	/**
	 * Closes a draft: recomputes its totals, assigns its number and stamps the issue date.
	 *
	 * The id travels in the URL, so the body carries only the etag the engine needs for its
	 * concurrency check.
	 */
	public issue(request: dyn.RestMutateOneRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		const { id, ...body } = request as dyn.RestMutateOneRequest & { id: string };
		return this.manageM2m(body as dyn.RestManageM2mRequest, `${id}/issue`);
	}
}

export const invoiceService = new InvoiceService();
