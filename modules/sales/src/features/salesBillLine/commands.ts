import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesBillLineService } from './salesBillLineService';
import { SALES_BILL_LINE_SCHEMA_NAME, SALES_MODULE } from '../../constants';


export const SalesBillLineCommands = Object.freeze(resourceCommands(SALES_BILL_LINE_SCHEMA_NAME));

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesBillLineCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_BILL_LINE_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_BILL_LINE_SCHEMA_NAME, salesBillLineService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
