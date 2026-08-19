import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { transactionService } from './transactionService';
import { PAYMENTINVOICE_MODULE, TRANSACTION_SCHEMA_NAME } from '../../constants';


/**
 * Command names for the transaction resource, all from the schema-driven generic path
 * (`core.resource.paymentinvoice_transaction.*`) served by the Shell's single prefix subscription.
 */
export const TransactionCommands = Object.freeze(resourceCommands(TRANSACTION_SCHEMA_NAME));

/**
 * Registers the transaction service. Called synchronously during the micro-app `init` so the
 * service is in place before any generic command is served.
 */
export function registerTransactionCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(TRANSACTION_SCHEMA_NAME, PAYMENTINVOICE_MODULE);
	registerCrudService(TRANSACTION_SCHEMA_NAME, transactionService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
