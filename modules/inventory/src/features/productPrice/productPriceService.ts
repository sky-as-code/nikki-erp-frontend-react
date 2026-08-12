import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, PRODUCT_PRICE_SCHEMA_NAME } from '../../constants';
import { inventoryStore } from '../../store';


/**
 * CRUD over `inventory_product_price`.
 *
 * Reading the price that currently applies to a product is a different question, answered by the
 * product variant's effective-product command: precedence between a variant rule and its
 * template's is resolved on the backend so that no consumer re-implements it.
 */
@storeService('ProductPriceService', inventoryStore)
export class ProductPriceService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: PRODUCT_PRICE_SCHEMA_NAME });
	}
}

export const productPriceService = new ProductPriceService();
