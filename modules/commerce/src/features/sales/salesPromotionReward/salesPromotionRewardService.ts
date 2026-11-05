import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../../constants/sales';
import { salesStore } from '../../../store/sales';
import { postRecordAction, ProductDeltaRequest, ScopeDeltaRequest } from '../promotionActions';


/**
 * A `specific_products` discount reaches the products and categories selected here.
 * Writes are refused unless the parent promotion is draft or suspended (`config_locked`), and each
 * one bumps the promotion's `config_version`.
 */
@storeService('SalesPromotionRewardService', salesStore)
export class SalesPromotionRewardService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_PROMOTION_REWARD_SCHEMA_NAME });
	}

	/** Removes selector rows by their own id, not the product's. */
	public manageProducts(request: ProductDeltaRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return postRecordAction(this, request, c.MANAGE_PRODUCTS_PATH);
	}

	/** Adds category ids; removes selector rows by their own id. */
	public manageCategories(request: ScopeDeltaRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return postRecordAction(this, request, c.MANAGE_CATEGORIES_PATH);
	}
}

export const salesPromotionRewardService = new SalesPromotionRewardService();
