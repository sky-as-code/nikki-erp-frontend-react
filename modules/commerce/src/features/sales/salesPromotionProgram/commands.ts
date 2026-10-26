import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesPromotionProgramService } from './salesPromotionProgramService';
import { SALES_PROMOTION_PROGRAM_SCHEMA_NAME, SALES_MODULE } from '../../constants';


export const SalesPromotionProgramCommands = Object.freeze(resourceCommands(SALES_PROMOTION_PROGRAM_SCHEMA_NAME));

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesPromotionProgramCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_PROMOTION_PROGRAM_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_PROMOTION_PROGRAM_SCHEMA_NAME, salesPromotionProgramService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
