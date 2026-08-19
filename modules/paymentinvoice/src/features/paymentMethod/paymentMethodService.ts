import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { PAYMENT_METHOD_SCHEMA_NAME, PAYMENTINVOICE_MODULE } from '../../constants';
import { paymentInvoiceStore } from '../../store';


/**
 * CRUD over `paymentinvoice_payment_method`. The engine serves every operation this needs.
 *
 * A method carries the `adapter_code` naming the gateway that serves it, which is what makes
 * offering a gateway under a second merchant account a row rather than a release.
 */
@storeService('PaymentMethodService', paymentInvoiceStore)
export class PaymentMethodService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: PAYMENTINVOICE_MODULE, schemaName: PAYMENT_METHOD_SCHEMA_NAME });
	}
}

export const paymentMethodService = new PaymentMethodService();
