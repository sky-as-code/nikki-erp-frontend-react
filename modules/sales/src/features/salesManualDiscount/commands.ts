import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesManualDiscountService } from './salesManualDiscountService';
import { SALES_MANUAL_DISCOUNT_SCHEMA_NAME, SALES_MODULE } from '../../constants';


export const SalesManualDiscountCommands = Object.freeze(resourceCommands(SALES_MANUAL_DISCOUNT_SCHEMA_NAME));

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesManualDiscountCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_MANUAL_DISCOUNT_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_MANUAL_DISCOUNT_SCHEMA_NAME, salesManualDiscountService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
