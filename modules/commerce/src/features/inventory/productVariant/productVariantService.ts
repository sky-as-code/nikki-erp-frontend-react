import { ServiceResult } from '@nikkierp/common/commandBus';
import { StoreCrudServiceBase, storeAsyncMethod, storeService } from '@nikkierp/ui/appState/store';

import * as t from './types';
import { INVENTORY_MODULE, PRODUCT_VARIANT_RESOURCE_PATH, PRODUCT_VARIANT_SCHEMA_NAME } from '../../constants';
import { inventoryStore } from '../../store';
import { apiGet } from '../http';


/**
 * CRUD over `inventory_product_variant`, plus the flattened-product read the engine serves at
 * `:id/effective`.
 */
@storeService('ProductVariantService', inventoryStore)
export class ProductVariantService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: PRODUCT_VARIANT_SCHEMA_NAME });
	}

	/**
	 * `GET {resource}/:id/effective` — the variant flattened together with its template.
	 *
	 * A plain GET rather than a schema `restApi` call, because `RestApi` models no custom read
	 * action. See AC-PROD-032.
	 */
	@storeAsyncMethod
	public getEffectiveProduct(variantId: string): Promise<ServiceResult<t.GetEffectiveProductResponse>> {
		return apiGet<t.GetEffectiveProductResponse>(`${PRODUCT_VARIANT_RESOURCE_PATH}/${variantId}/effective`);
	}
}

export const productVariantService = new ProductVariantService();
