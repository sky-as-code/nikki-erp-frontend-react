import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../constants';
import { salesStore } from '../../store';


/**
 * The refund request is the sales return. Three actions move it: confirm is business approval and
 * records the note, process dispatches the money and the goods, cancel withdraws a request that has
 * not gone out. Each carries its own backend permission.
 */
@storeService('SalesReturnService', salesStore)
export class SalesReturnService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_RETURN_SCHEMA_NAME });
	}

	/**
	 * Approves a draft request and dispatches it. The note travels as `refund_note`, the name the
	 * backend action takes; on the row it is stored as `confirmation_note`.
	 */
	public confirm(request: ConfirmReturnRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.CONFIRM_RETURN_PATH);
	}

	public process(request: ReturnActionRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.PROCESS_RETURN_PATH);
	}

	public cancel(request: ReturnActionRequest & { reason?: string }): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return this.postAction(request, c.CANCEL_PATH);
	}

	/** Same routing as the order's actions: the id goes into the sub-path, see SalesOrderService. */
	private postAction(
		request: Record<string, unknown>, action: string,
	): Promise<ServiceResult<dyn.RestMutateResponse>> {
		const id = request.id as string | undefined;
		const path = id ? `${id}/${action}` : action;
		return this.manageM2m(request as dyn.RestManageM2mRequest, path);
	}
}

export type ReturnActionRequest = {
	id: string,
	etag?: string,
};

export type ConfirmReturnRequest = ReturnActionRequest & {
	refund_note?: string,
};

export const salesReturnService = new SalesReturnService();
