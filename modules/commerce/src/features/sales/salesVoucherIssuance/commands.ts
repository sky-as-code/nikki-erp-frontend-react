import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesVoucherIssuanceService } from './salesVoucherIssuanceService';
import { SALES_VOUCHER_ISSUANCE_SCHEMA_NAME, SALES_MODULE } from '../../../constants/sales';


export const SalesVoucherIssuanceCommands = Object.freeze(resourceCommands(SALES_VOUCHER_ISSUANCE_SCHEMA_NAME));

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesVoucherIssuanceCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_VOUCHER_ISSUANCE_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_VOUCHER_ISSUANCE_SCHEMA_NAME, salesVoucherIssuanceService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
