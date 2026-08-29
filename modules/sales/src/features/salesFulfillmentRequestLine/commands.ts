import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesFulfillmentRequestLineService } from './salesFulfillmentRequestLineService';
import { SALES_FULFILLMENT_REQUEST_LINE_SCHEMA_NAME, SALES_MODULE } from '../../constants';


export const SalesFulfillmentRequestLineCommands = Object.freeze(
	resourceCommands(SALES_FULFILLMENT_REQUEST_LINE_SCHEMA_NAME),
);

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesFulfillmentRequestLineCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_FULFILLMENT_REQUEST_LINE_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_FULFILLMENT_REQUEST_LINE_SCHEMA_NAME, salesFulfillmentRequestLineService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
