import { Command, ICommandBus } from '@nikkierp/common/commandBus';
import { registerCrudService, registerSchemaModule, resourceCommands } from '@nikkierp/common/dynamicModel';

import { GenerateVoucherBatchRequest, RevokeVoucherRequest, salesVoucherService } from './salesVoucherService';
import { SALES_MODULE, SALES_VOUCHER_SCHEMA_NAME, VOUCHER_BATCH_MAX } from '../../../constants/sales';
import { payloadOf, recordActionRequest } from '../promotionActions';


const PREFIX = `${SALES_MODULE}.${SALES_VOUCHER_SCHEMA_NAME}`;

export const SalesVoucherCommands = Object.freeze({
	...resourceCommands(SALES_VOUCHER_SCHEMA_NAME),
	GENERATE_BATCH: `${PREFIX}.generate_batch`,
	REVOKE: `${PREFIX}.revoke`,
} as const);

export function registerSalesVoucherCommands(bus: ICommandBus): () => void {
	registerSchemaModule(SALES_VOUCHER_SCHEMA_NAME, SALES_MODULE);
	registerCrudService(SALES_VOUCHER_SCHEMA_NAME, salesVoucherService);

	const unsubscribers = [
		bus.subscribe(
			SalesVoucherCommands.GENERATE_BATCH, cmd => salesVoucherService.generateBatch(generateBatchRequest(cmd)),
		),
		bus.subscribe(SalesVoucherCommands.REVOKE, cmd => salesVoucherService.revoke(revokeRequest(cmd))),
	];
	return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}

/** Optional fields are omitted when blank; the backend reads an absent one as "use the promotion's". */
export function generateBatchRequest(command: Command): GenerateVoucherBatchRequest {
	const payload = payloadOf(command);
	const quantity = Math.min(Math.max(Math.trunc(Number(payload.quantity ?? 0)), 0), VOUCHER_BATCH_MAX);
	const request: GenerateVoucherBatchRequest = { promotion_id: String(payload.promotion_id ?? ''), quantity };
	for (const key of ['org_id', 'prefix', 'valid_from', 'expires_at', 'customer_id'] as const) {
		const value = payload[key];
		if (value != null && value !== '') {
			request[key] = String(value);
		}
	}
	const usageLimit = Number(payload.usage_limit);
	if (payload.usage_limit != null && payload.usage_limit !== '' && Number.isFinite(usageLimit)) {
		request.usage_limit = Math.trunc(usageLimit);
	}
	return request;
}

/** The revoke prompt collects `note`; the reason is always `manual` from here. */
function revokeRequest(command: Command): RevokeVoucherRequest {
	const note = payloadOf(command).note;
	const request = recordActionRequest(command);
	return note == null || note === '' ? request : { ...request, note: String(note) };
}
