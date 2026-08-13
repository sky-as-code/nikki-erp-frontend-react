import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import { INVENTORY_MODULE, STOCK_SCRAP_SCHEMA_NAME } from '../../constants';
import { inventoryStore } from '../../store';


/**
 * CRUD over `inventory_stock_scrap`, plus the operation that executes it.
 *
 * The write operations are real here, unlike the stock balance's: a scrap is a document a user
 * raises and may abandon while it is draft. What the backend constrains is *when* — a done scrap
 * can be neither edited nor deleted, because the movement it generated is permanent and the
 * document is what explains it (BR §4.2.9.4, §4.2.9.6, AC-STOCK-020).
 */
@storeService('StockScrapService', inventoryStore)
export class StockScrapService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: INVENTORY_MODULE, schemaName: STOCK_SCRAP_SCHEMA_NAME });
	}

	/**
	 * Executes the scrap: generates the movement that writes the goods off (BR §4.2.9.5).
	 *
	 * A POST rather than an update, because it is not an edit to the document — it is the event
	 * that removes the stock, and no later edit can undo it.
	 */
	public doScrap(request: dyn.RestMutateOneRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		const { id, ...body } = request as dyn.RestMutateOneRequest & { id: string };
		return this.manageM2m(body as dyn.RestManageM2mRequest, `${id}/do_scrap`);
	}
}

export const stockScrapService = new StockScrapService();
