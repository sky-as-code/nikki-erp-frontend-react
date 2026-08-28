import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesBillRelationService } from './salesBillRelationService';
import { SALES_BILL_RELATION_SCHEMA_NAME, SALES_MODULE } from '../../constants';


export const SalesBillRelationCommands = Object.freeze(resourceCommands(SALES_BILL_RELATION_SCHEMA_NAME));

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesBillRelationCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_BILL_RELATION_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_BILL_RELATION_SCHEMA_NAME, salesBillRelationService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
