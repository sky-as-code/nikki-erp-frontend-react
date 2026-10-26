import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, WAREHOUSE_SCHEMA_NAME } from '../../constants';
import { inventoryStore } from '../../store';


/**
 * CRUD over `inventory_warehouse`, plus the four operations that are not CRUD.
 *
 * Suspending closes a warehouse temporarily and archiving withdraws it; the two are separate
 * powers with separate permissions, which is why suspend is not an update to a status field.
 * The flow operations write the warehouse and provision its locations together, so they are
 * likewise a single endpoint rather than an edit.
 */
@storeService('WarehouseService', inventoryStore)
export class WarehouseService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: WAREHOUSE_SCHEMA_NAME });
	}

	/** Closes the warehouse temporarily. Its locations and everything in them stay put. */
	public suspend(request: dyn.RestMutateOneRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.runOperation(request, 'suspend');
	}

	/** Returns a suspended warehouse to service, once its configuration still holds. */
	public resume(request: dyn.RestMutateOneRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.runOperation(request, 'resume');
	}

	/**
	 * Changes how many stops goods make on the way in, provisioning the locations the new shape
	 * needs. It creates no stock move: a receipt already under way keeps the shape it began with.
	 */
	public configureIncomingFlow(
		request: dyn.RestMutateOneRequest,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.runOperation(request, 'configure_incoming_flow');
	}

	/** Changes how many stops goods make on the way out. Same rules as the incoming flow. */
	public configureOutgoingFlow(
		request: dyn.RestMutateOneRequest,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.runOperation(request, 'configure_outgoing_flow');
	}

	/**
	 * Posts to `:id/{action}`.
	 *
	 * It goes through manageM2m because that is the only base-class method that posts to an
	 * arbitrary sub-path; the name is about its usual caller, not a constraint on the path. The id
	 * travels in the URL, so the body carries only what the action itself needs.
	 */
	private runOperation(
		request: dyn.RestMutateOneRequest, action: string,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		const { id, ...body } = request as dyn.RestMutateOneRequest & { id: string };
		return this.manageM2m(body as dyn.RestManageM2mRequest, `${id}/${action}`);
	}
}

export const warehouseService = new WarehouseService();
