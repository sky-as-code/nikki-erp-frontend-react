import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesOrderEventService } from './salesOrderEventService';
import { SALES_ORDER_EVENT_SCHEMA_NAME, SALES_MODULE } from '../../constants';


export const SalesOrderEventCommands = Object.freeze(resourceCommands(SALES_ORDER_EVENT_SCHEMA_NAME));

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesOrderEventCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_ORDER_EVENT_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_ORDER_EVENT_SCHEMA_NAME, salesOrderEventService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
