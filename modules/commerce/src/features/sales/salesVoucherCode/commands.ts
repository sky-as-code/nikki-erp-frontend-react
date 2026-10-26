import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesVoucherCodeService } from './salesVoucherCodeService';
import { SALES_VOUCHER_CODE_SCHEMA_NAME, SALES_MODULE } from '../../constants';


export const SalesVoucherCodeCommands = Object.freeze(resourceCommands(SALES_VOUCHER_CODE_SCHEMA_NAME));

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesVoucherCodeCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_VOUCHER_CODE_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_VOUCHER_CODE_SCHEMA_NAME, salesVoucherCodeService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
