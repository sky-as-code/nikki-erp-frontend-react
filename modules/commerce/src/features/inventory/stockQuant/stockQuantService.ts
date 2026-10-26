import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, STOCK_QUANT_SCHEMA_NAME } from '../../constants';
import { inventoryStore } from '../../store';


/**
 * Reads over `inventory_stock_quant`, plus the five counting operations.
 *
 * The base class supplies the write operations too, but the backend engine refuses create, update
 * and delete on this resource: a balance is the running total of completed movements, not
 * something a client sets. They are left inherited rather than overridden to throw, because the
 * server is the single authority on that rule and a second copy of it here could drift. The stock
 * balance page simply offers no write action. See BR §3.3 and AC-STOCK-002.
 *
 * The counting operations are not an exception to that rule. None of them writes a balance: enter
 * and reset write count metadata, and apply changes the on-hand quantity only by generating an
 * adjustment movement. See BR §4.2.7.
 */
@storeService('StockQuantService', inventoryStore)
export class StockQuantService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: STOCK_QUANT_SCHEMA_NAME });
	}

	/**
	 * Records what a physical count found and snapshots the current balance. Changes no on-hand
	 * quantity (AC-STOCK-014).
	 */
	public enterCount(request: dyn.RestMutateOneRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.runOperation(request, 'enter_count');
	}

	/** Abandons a pending count, leaving the balance exactly as it was (BR §4.2.7.6). */
	public resetCount(request: dyn.RestMutateOneRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.runOperation(request, 'reset_count');
	}

	/**
	 * Turns a pending count into a real balance change by generating an adjustment movement.
	 * Refused when the snapshot has gone stale (AC-STOCK-015).
	 */
	public applyAdjustment(request: dyn.RestMutateOneRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.runOperation(request, 'apply_adjustment');
	}

	/** Sets when this balance is next due to be counted (BR §4.2.8). */
	public scheduleCount(request: dyn.RestMutateOneRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.runOperation(request, 'schedule_count');
	}

	/** Names who is responsible for counting this balance (BR §4.2.8). */
	public assignCounter(request: dyn.RestMutateOneRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.runOperation(request, 'assign_counter');
	}

	/**
	 * Posts to `{resource}/{id}/{action}`.
	 *
	 * The same shape as StockTransferService.runOperation, including the reason it goes through
	 * manageM2m: that is the only base-class method posting to an arbitrary sub-path. The id
	 * travels in the URL and everything else becomes the body, which is how a prompted action's
	 * collected fields reach the server.
	 */
	private runOperation(
		request: dyn.RestMutateOneRequest, action: string,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		const { id, ...body } = request as dyn.RestMutateOneRequest & { id: string };
		return this.manageM2m(body as dyn.RestManageM2mRequest, `${id}/${action}`);
	}
}

export const stockQuantService = new StockQuantService();
