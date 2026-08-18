import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { invoiceService } from './invoiceService';
import { INVOICE_SCHEMA_NAME, PAYMENTINVOICE_MODULE } from '../../constants';


const PREFIX = `${PAYMENTINVOICE_MODULE}.${INVOICE_SCHEMA_NAME}`;

/**
 * Command names for the invoice resource.
 *
 * The CRUD names come from the schema-driven generic path
 * (`core.resource.paymentinvoice_invoice.*`), served by the Shell's single prefix subscription.
 * Issue is not CRUD and carries its own permission on the backend.
 */
export const InvoiceCommands = Object.freeze({
	...resourceCommands(INVOICE_SCHEMA_NAME),
	ISSUE: `${PREFIX}.issue`,
} as const);

/**
 * Registers the invoice service and subscribes the issue handler. Called synchronously during the
 * micro-app `init` so lazy command resolution finds it.
 * Returns a function that unsubscribes every handler (for teardown).
 */
export function registerInvoiceCommands(bus: ICommandBus): () => void {
	registerSchemaModule(INVOICE_SCHEMA_NAME, PAYMENTINVOICE_MODULE);
	registerCrudService(INVOICE_SCHEMA_NAME, invoiceService);

	const unsubscribers = [
		bus.subscribe(InvoiceCommands.ISSUE, cmd => invoiceService.issue(request(cmd))),
	];

	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

/**
 * The payload a contextual action publishes: the record's `{id, etag}`. Issue collects nothing
 * further — everything the issued document says is computed from what is already recorded against
 * it, which is what makes the totals agree with the lines.
 */
function request(command: Command): dyn.RestMutateOneRequest {
	return command.payload as dyn.RestMutateOneRequest;
}
