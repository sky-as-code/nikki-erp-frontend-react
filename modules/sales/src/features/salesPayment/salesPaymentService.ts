import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * Read-only over HTTP: a payment is recorded through the bill's `pay` action, which applies gates a
 * plain POST would bypass, among them that the method is both mapped to the channel and usable in
 * the running build. Only a `captured` payment counts toward settlement, since an authorization is
 * a hold the provider may still release.
 */
@storeService('SalesPaymentService', salesStore)
export class SalesPaymentService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_PAYMENT_SCHEMA_NAME });
	}
}

export const salesPaymentService = new SalesPaymentService();
