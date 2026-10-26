import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import {
	BillActionRequest, MergeBillsRequest, RecordPaymentRequest, salesBillService, SplitBillPart,
	SplitBillRequest,
} from './salesBillService';
import { SALES_BILL_SCHEMA_NAME, SALES_MODULE } from '../../constants';


const PREFIX = `${SALES_MODULE}.${SALES_BILL_SCHEMA_NAME}`;

/** CRUD comes from the generic path; the four below are settlement actions, each separately permissioned. */
export const SalesBillCommands = Object.freeze({
	...resourceCommands(SALES_BILL_SCHEMA_NAME),
	SPLIT: `${PREFIX}.split`,
	MERGE: `${PREFIX}.merge`,
	PAY: `${PREFIX}.pay`,
	SETTLE: `${PREFIX}.settle`,
} as const);

/** Must run synchronously during the micro-app `init` so lazy command resolution finds the handlers. */
export function registerSalesBillCommands(bus: ICommandBus): () => void {
	registerSchemaModule(SALES_BILL_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_BILL_SCHEMA_NAME, salesBillService);

	const unsubscribers = [
		bus.subscribe(SalesBillCommands.SPLIT, cmd => salesBillService.split(splitRequest(cmd))),
		bus.subscribe(SalesBillCommands.MERGE, cmd => salesBillService.merge(mergeRequest(cmd))),
		bus.subscribe(SalesBillCommands.PAY, cmd => salesBillService.pay(payRequest(cmd))),
		bus.subscribe(SalesBillCommands.SETTLE, cmd => salesBillService.settle(actionRequest(cmd))),
	];

	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

function actionRequest(command: Command): BillActionRequest {
	const payload = command.payload as Record<string, unknown>;
	return {
		id: String(payload.id ?? ''),
		etag: payload.etag == null ? undefined : String(payload.etag),
	};
}

/**
 * Anything other than `allocations` on a part is ignored by the backend, so it is dropped here
 * rather than forwarded as a field that looks accepted and is not.
 */
function splitRequest(command: Command): SplitBillRequest {
	const payload = command.payload as Record<string, unknown>;
	const parts = Array.isArray(payload.parts) ? payload.parts : [];
	return {
		...actionRequest(command),
		parts: parts.map(part => {
			const allocations = (part as Record<string, unknown>).allocations;
			const entries = allocations && typeof allocations === 'object'
				? Object.entries(allocations as Record<string, unknown>)
				: [];
			return {
				allocations: Object.fromEntries(entries.map(([k, v]) => [k, String(v)])),
			} satisfies SplitBillPart;
		}),
	};
}

/**
 * Collection-level: the id of the record the action fired on is deliberately dropped, because the
 * backend chooses the merge target itself.
 */
function mergeRequest(command: Command): MergeBillsRequest {
	const payload = command.payload as Record<string, unknown>;
	const ids = payload.source_bill_ids ?? payload.ids;
	return {
		source_bill_ids: Array.isArray(ids) ? ids.map(String) : [],
	};
}

/** `status` is left to the backend default (`captured`) rather than restated in two places. */
function payRequest(command: Command): RecordPaymentRequest {
	const payload = command.payload as Record<string, unknown>;
	return {
		...actionRequest(command),
		payment_method_id: String(payload.payment_method_id ?? ''),
		amount: String(payload.amount ?? ''),
		currency_code: String(payload.currency_code ?? ''),
		external_transaction_id: optionalString(payload.external_transaction_id),
		provider_reference: optionalString(payload.provider_reference),
		status: optionalString(payload.status),
	};
}

function optionalString(value: unknown): string | undefined {
	return value == null || value === '' ? undefined : String(value);
}
