import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, STOCK_RESERVATION_SCHEMA_NAME } from '../../constants';
import { inventoryStore } from '../../store';


/**
 * Reads over `inventory_stock_reservation`, plus the one operation a user may run on a row.
 *
 * The built-in writes are withheld on the backend: a reservation is written by reserving,
 * consuming, releasing and protecting, never by editing the row. Release is the operation an
 * operator reaches for when a demand is abandoned; it moves no stock.
 */
@storeService('StockReservationService', inventoryStore)
export class StockReservationService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: STOCK_RESERVATION_SCHEMA_NAME });
	}

	/** Gives back the unconsumed remainder. Idempotent: a hold already gone answers success. */
	public release(request: ReleaseReservationRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		const { id, ...body } = request;
		return this.manageM2m(body as dyn.RestManageM2mRequest, `${id}/release`);
	}
}

export type ReleaseReservationRequest = {
	id: string,
	etag?: string,
	reason?: string,
};

export const stockReservationService = new StockReservationService();
