import { ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { invoiceLineService } from './invoiceLineService';
import { INVOICE_LINE_SCHEMA_NAME, PAYMENTINVOICE_MODULE } from '../../constants';


/**
 * Command names for the invoice line resource, all from the schema-driven generic path
 * (`core.resource.paymentinvoice_invoice_line.*`) served by the Shell's single prefix
 * subscription.
 */
export const InvoiceLineCommands = Object.freeze(resourceCommands(INVOICE_LINE_SCHEMA_NAME));

/**
 * Registers the invoice line service. Called synchronously during the micro-app `init` so the
 * service is in place before any generic command is served.
 */
export function registerInvoiceLineCommands(_bus: ICommandBus): () => void {
	registerSchemaModule(INVOICE_LINE_SCHEMA_NAME, PAYMENTINVOICE_MODULE);
	registerCrudService(INVOICE_LINE_SCHEMA_NAME, invoiceLineService);
	return () => { /* No exact-name subscriptions to undo; CRUD is served by the Shell prefix. */ };
}
