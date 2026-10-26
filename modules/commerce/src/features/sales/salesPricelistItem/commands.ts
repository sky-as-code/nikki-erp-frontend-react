import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesPricelistItemService } from './salesPricelistItemService';
import { SALES_PRICELIST_ITEM_SCHEMA_NAME, SALES_MODULE } from '../../constants';


export const SalesPricelistItemCommands = Object.freeze(resourceCommands(SALES_PRICELIST_ITEM_SCHEMA_NAME));

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesPricelistItemCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_PRICELIST_ITEM_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_PRICELIST_ITEM_SCHEMA_NAME, salesPricelistItemService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
