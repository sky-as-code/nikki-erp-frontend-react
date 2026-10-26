import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import {
	FiscalBuyer, RequestInvoiceRequest, salesFiscalRequestService,
} from './salesFiscalRequestService';
import { SALES_FISCAL_REQUEST_SCHEMA_NAME, SALES_MODULE } from '../../constants';


const PREFIX = `${SALES_MODULE}.${SALES_FISCAL_REQUEST_SCHEMA_NAME}`;

/**
 * Only read and create are permitted by the backend IAM seed; update, delete and archive return
 * 403. They stay in the generated set because the permission, not this list, is the authority.
 */
export const SalesFiscalRequestCommands = Object.freeze({
	...resourceCommands(SALES_FISCAL_REQUEST_SCHEMA_NAME),
	REQUEST_INVOICE: `${PREFIX}.request_invoice`,
} as const);

export function registerSalesFiscalRequestCommands(bus: ICommandBus): () => void {
	registerSchemaModule(SALES_FISCAL_REQUEST_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_FISCAL_REQUEST_SCHEMA_NAME, salesFiscalRequestService);

	const unsubscribers = [
		bus.subscribe(
			SalesFiscalRequestCommands.REQUEST_INVOICE,
			cmd => salesFiscalRequestService.requestInvoice(requestInvoiceRequest(cmd)),
		),
	];

	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

/**
 * Collection-level: it names a bill, not a fiscal request. `intent` and `idempotency_key` are
 * omitted rather than sent empty, leaving the backend defaults as the single source.
 */
function requestInvoiceRequest(command: Command): RequestInvoiceRequest {
	const payload = command.payload as Record<string, unknown>;
	return {
		sales_bill_id: String(payload.sales_bill_id ?? payload.id ?? ''),
		intent: optionalString(payload.intent),
		original_fiscal_request_id: optionalString(payload.original_fiscal_request_id),
		reason: optionalString(payload.reason),
		idempotency_key: optionalString(payload.idempotency_key),
		buyer: buyerOf(payload.buyer),
	};
}

/**
 * Never send an empty object in place of an absent buyer: the backend snapshots what it is given,
 * and a snapshot of four empty strings is worse than no snapshot.
 */
function buyerOf(value: unknown): FiscalBuyer | undefined {
	if (value == null || typeof value !== 'object') {
		return undefined;
	}
	const fields = value as Record<string, unknown>;
	const buyer: FiscalBuyer = {
		tax_code: optionalString(fields.tax_code),
		legal_name: optionalString(fields.legal_name),
		address: optionalString(fields.address),
		email: optionalString(fields.email),
	};
	return Object.values(buyer).some(field => field !== undefined) ? buyer : undefined;
}

function optionalString(value: unknown): string | undefined {
	return value == null || value === '' ? undefined : String(value);
}
