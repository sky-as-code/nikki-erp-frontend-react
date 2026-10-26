import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesQuotationLineService } from './salesQuotationLineService';
import { SALES_QUOTATION_LINE_SCHEMA_NAME, SALES_MODULE } from '../../constants';


export const SalesQuotationLineCommands = Object.freeze(resourceCommands(SALES_QUOTATION_LINE_SCHEMA_NAME));

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesQuotationLineCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_QUOTATION_LINE_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_QUOTATION_LINE_SCHEMA_NAME, salesQuotationLineService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
