import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesFulfillmentRequestService } from './salesFulfillmentRequestService';
import { SALES_FULFILLMENT_REQUEST_SCHEMA_NAME, SALES_MODULE } from '../../constants';


export const SalesFulfillmentRequestCommands = Object.freeze(resourceCommands(SALES_FULFILLMENT_REQUEST_SCHEMA_NAME));

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesFulfillmentRequestCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_FULFILLMENT_REQUEST_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_FULFILLMENT_REQUEST_SCHEMA_NAME, salesFulfillmentRequestService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
