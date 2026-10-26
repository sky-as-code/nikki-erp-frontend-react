import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesComboService } from './salesComboService';
import { SALES_COMBO_SCHEMA_NAME, SALES_MODULE } from '../../constants';


export const SalesComboCommands = Object.freeze(resourceCommands(SALES_COMBO_SCHEMA_NAME));

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesComboCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_COMBO_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_COMBO_SCHEMA_NAME, salesComboService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
