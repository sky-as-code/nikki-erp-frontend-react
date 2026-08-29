import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesVoucherRedemptionService } from './salesVoucherRedemptionService';
import { SALES_VOUCHER_REDEMPTION_SCHEMA_NAME, SALES_MODULE } from '../../constants';


export const SalesVoucherRedemptionCommands = Object.freeze(resourceCommands(SALES_VOUCHER_REDEMPTION_SCHEMA_NAME));

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesVoucherRedemptionCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_VOUCHER_REDEMPTION_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_VOUCHER_REDEMPTION_SCHEMA_NAME, salesVoucherRedemptionService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
