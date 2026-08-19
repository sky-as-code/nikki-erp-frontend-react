import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVOICE_LINE_SCHEMA_NAME, PAYMENTINVOICE_MODULE } from '../../constants';
import { paymentInvoiceStore } from '../../store';


/**
 * CRUD over `paymentinvoice_invoice_line`. The engine serves every operation this needs.
 *
 * A line has no page of its own: it is reached as a related record of the invoice that owns it,
 * which is the only context in which it means anything.
 */
@storeService('InvoiceLineService', paymentInvoiceStore)
export class InvoiceLineService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: PAYMENTINVOICE_MODULE, schemaName: INVOICE_LINE_SCHEMA_NAME });
	}
}

export const invoiceLineService = new InvoiceLineService();
