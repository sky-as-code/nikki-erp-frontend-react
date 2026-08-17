import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, STOCK_TRANSFER_SCHEMA_NAME } from '../../constants';
import { inventoryStore } from '../../store';


/**
 * CRUD over `inventory_stock_transfer`, plus the six movement operations.
 *
 * The operations are POSTs to `:id/{action}` rather than updates, because none of them is a CRUD
 * verb: validating a transfer is not an edit to it, it is an event that happens to it and moves
 * real goods. The backend exposes each as its own engine action with its own permission, so that a
 * role permitted to edit a transfer's note is not thereby permitted to ship its contents.
 */
@storeService('StockTransferService', inventoryStore)
export class StockTransferService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: STOCK_TRANSFER_SCHEMA_NAME });
	}

	/**
	 * Takes a draft transfer out of draft, reserving stock when its snapshot policy says so.
	 * Changes no on-hand quantity (AC-STOCK-004).
	 */
	public confirm(request: dyn.RestMutateOneRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.runOperation(request, 'confirm');
	}

	/**
	 * Reports demand, availability and shortage per move, and claims nothing.
	 *
	 * Read-only by design: after checking, another request may still reserve the stock it reported
	 * as available (BR §4.2.3.7, AC-STOCK-033). It answers "is it worth trying", not "it is mine".
	 */
	public checkAvailability(
		request: dyn.RestMutateOneRequest,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.runOperation(request, 'check_availability');
	}

	/** Claims stock for the transfer's moves. Changes only reserved quantities (AC-STOCK-005). */
	public reserve(request: dyn.RestMutateOneRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.runOperation(request, 'reserve');
	}

	/** Releases the transfer's claims, leaving on-hand untouched (BR §4.2.3.9). */
	public unreserve(request: dyn.RestMutateOneRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.runOperation(request, 'unreserve');
	}

	/**
	 * Executes the transfer: the only operation that changes an on-hand balance, and the one no
	 * edit can undo (BR §4.2.3.10).
	 */
	public validate(request: dyn.RestMutateOneRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.runOperation(request, 'validate');
	}

	/** Abandons an unfinished transfer, releasing whatever it holds. Refused once done. */
	public cancel(request: dyn.RestMutateOneRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.runOperation(request, 'cancel');
	}

	/**
	 * Raises a reverse transfer for goods coming back (BR §4.2.10, AC-STOCK-021).
	 *
	 * The original is never touched. With no `lines` in the body the backend returns the full
	 * returnable quantity per move, which is what the action bar sends: the result is a draft the
	 * user can trim before confirming.
	 */
	public createReturn(request: dyn.RestMutateOneRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.runOperation(request, 'create_return');
	}

	/**
	 * Posts to `{resource}/{id}/{action}`.
	 *
	 * It goes through manageM2m because that is the only base-class method that posts to an
	 * arbitrary sub-path; the name is about its usual caller, not a constraint on the path. The id
	 * travels in the URL, so the body carries only the etag the engine needs for its concurrency
	 * check.
	 */
	private runOperation(
		request: dyn.RestMutateOneRequest, action: string,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		const { id, ...body } = request as dyn.RestMutateOneRequest & { id: string };
		return this.manageM2m(body as dyn.RestManageM2mRequest, `${id}/${action}`);
	}
}

export const stockTransferService = new StockTransferService();
