import { PageNode } from '@nikkierp/viewengine/metadata';

import { buildInvoicePages } from '../pages/paymentinvoice/invoice';
import { buildOrderPages } from '../pages/paymentinvoice/order';
import { buildTransactionPages } from '../pages/paymentinvoice/transaction';


/**
 * Payment pages proxied from the paymentinvoice micro-app, which keeps its schemas, services and
 * handlers: Commerce registers none of them, so the two never collide while both are loaded.
 */
export function buildPaymentInvoicePages(): PageNode[] {
	return [
		...buildOrderPages(),
		...buildTransactionPages(),
		...buildInvoicePages(),
	];
}
