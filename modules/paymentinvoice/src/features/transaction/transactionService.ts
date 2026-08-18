import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { PAYMENTINVOICE_MODULE, TRANSACTION_SCHEMA_NAME } from '../../constants';
import { paymentInvoiceStore } from '../../store';


/**
 * CRUD over `paymentinvoice_transaction`. The engine serves every operation this needs.
 *
 * Transactions are written by the payment flow rather than typed in — one payment transaction with
 * the order, one refund transaction per successful refund — so the pages over this are read-only.
 * The service still carries full CRUD because the engine does, and narrowing it here would only
 * move the refusal from the backend to a place with less context.
 */
@storeService('TransactionService', paymentInvoiceStore)
export class TransactionService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: PAYMENTINVOICE_MODULE, schemaName: TRANSACTION_SCHEMA_NAME });
	}
}

export const transactionService = new TransactionService();
