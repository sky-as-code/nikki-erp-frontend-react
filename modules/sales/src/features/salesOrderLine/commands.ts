import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesOrderLineService } from './salesOrderLineService';
import { SALES_ORDER_LINE_SCHEMA_NAME, SALES_MODULE } from '../../constants';


export const SalesOrderLineCommands = Object.freeze(resourceCommands(SALES_ORDER_LINE_SCHEMA_NAME));

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesOrderLineCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_ORDER_LINE_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_ORDER_LINE_SCHEMA_NAME, salesOrderLineService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
