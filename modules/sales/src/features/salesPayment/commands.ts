import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesPaymentService } from './salesPaymentService';
import { SALES_PAYMENT_SCHEMA_NAME, SALES_MODULE } from '../../constants';


export const SalesPaymentCommands = Object.freeze(resourceCommands(SALES_PAYMENT_SCHEMA_NAME));

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesPaymentCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_PAYMENT_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_PAYMENT_SCHEMA_NAME, salesPaymentService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
