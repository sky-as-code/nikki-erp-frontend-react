import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../../constants/sales';
import { salesStore } from '../../../store/sales';
import { postRecordAction, RecordActionRequest, ScopeDeltaRequest } from '../promotionActions';


/**
 * CRUD over `sales_promotion` plus its lifecycle. Activate validates the whole configuration and answers
 * `activation_invalid` with one violation per missing piece; it never fills in "every point" by itself.
 * Duplicate answers a new draft with a new reference and no vouchers, usage or history.
 */
@storeService('SalesPromotionService', salesStore)
export class SalesPromotionService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_PROMOTION_SCHEMA_NAME });
	}

	public activate(request: RecordActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return postRecordAction(this, request, c.ACTIVATE_PATH);
	}

	public suspend(request: RecordActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return postRecordAction(this, request, c.SUSPEND_PATH);
	}

	public duplicate(request: RecordActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return postRecordAction(this, request, c.DUPLICATE_PATH);
	}

	/** A promotion applies only where it is linked to both a channel and a point (BR-S01). */
	public manageChannels(request: ScopeDeltaRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return postRecordAction(this, request, c.MANAGE_CHANNELS_PATH);
	}

	public managePoints(request: ScopeDeltaRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return postRecordAction(this, request, c.MANAGE_POINTS_PATH);
	}

	/** No pricelist link means every pricelist; a link narrows eligible lines to those priced by it. */
	public managePricelists(request: ScopeDeltaRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return postRecordAction(this, request, c.MANAGE_PRICELISTS_PATH);
	}
}

export const salesPromotionService = new SalesPromotionService();
