import { ServiceResult } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { StoreCrudServiceBase, storeService } from '@nikkierp/ui/appState/store';

import * as c from '../../../constants/sales';
import { salesStore } from '../../../store/sales';
import { postRecordAction, RecordActionRequest } from '../promotionActions';


/**
 * Codes are matched trimmed and uppercased (`normalized_code`), unique per org including archived and revoked
 * ones, so a withdrawn code can never be reissued to someone else. Never log a code: log the voucher id.
 */
@storeService('SalesVoucherService', salesStore)
export class SalesVoucherService extends StoreCrudServiceBase {
	public constructor() {
		super({ moduleName: c.SALES_MODULE, schemaName: c.SALES_VOUCHER_SCHEMA_NAME });
	}

	/** Collection-level; answers `{count, vouchers: [{id, code}]}`, the only time the codes come back in bulk. */
	public generateBatch(request: GenerateVoucherBatchRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return postRecordAction(this, request, c.GENERATE_BATCH_PATH);
	}

	/** Terminal: a revoked code stays reserved (unique) and is never available again. */
	public revoke(request: RevokeVoucherRequest): Promise<ServiceResult<dyn.RestMutateResponse>> {
		return postRecordAction(this, request, c.REVOKE_PATH);
	}
}

export type GenerateVoucherBatchRequest = {
	org_id?: string,
	promotion_id: string,
	quantity: number,
	prefix?: string,
	valid_from?: string,
	expires_at?: string,
	customer_id?: string,
	usage_limit?: number,
};

export type GenerateVoucherBatchResponse = {
	count: number,
	vouchers: { id: string, code: string }[],
};

export type RevokeVoucherRequest = RecordActionRequest & {
	note?: string,
};

export const salesVoucherService = new SalesVoucherService();
