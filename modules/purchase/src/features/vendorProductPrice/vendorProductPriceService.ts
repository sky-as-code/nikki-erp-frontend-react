import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { PURCHASE_MODULE, VENDOR_PRODUCT_PRICE_SCHEMA_NAME } from '../../constants';
import { purchaseStore } from '../../store';


/**
 * CRUD over `purchase_vendor_product_price`. The engine serves every operation this needs.
 *
 * What a vendor currently offers a product at, by quantity, unit and validity. It is master data
 * rather than a document: nothing about it is a lifecycle, so unlike the order and the agreement
 * this service adds no custom actions to the built-in five.
 */
@storeService('VendorProductPriceService', purchaseStore)
export class VendorProductPriceService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: PURCHASE_MODULE, schemaName: VENDOR_PRODUCT_PRICE_SCHEMA_NAME });
	}
}

export const vendorProductPriceService = new VendorProductPriceService();
