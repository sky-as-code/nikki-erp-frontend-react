import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { salesOrderVoucherService } from './salesOrderVoucherService';
import { SALES_ORDER_VOUCHER_SCHEMA_NAME, SALES_MODULE } from '../../../constants/sales';


export const SalesOrderVoucherCommands = Object.freeze(resourceCommands(SALES_ORDER_VOUCHER_SCHEMA_NAME));

/** Must run synchronously during the micro-app `init`, before any generic command is served. */
export function registerSalesOrderVoucherCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(SALES_ORDER_VOUCHER_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_ORDER_VOUCHER_SCHEMA_NAME, salesOrderVoucherService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
