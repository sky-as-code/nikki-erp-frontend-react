import { describe, expect, it } from 'vitest';

import { productDeltaRequest, scopeDeltaRequest } from './promotionActions';
import { applyVoucherRequest, selectRewardRequest } from './salesOrder/promotionCommands';
import { generateBatchRequest } from './salesVoucher/commands';

import type { Command } from '@nikkierp/common/commandBus';


function command(payload: Record<string, unknown>): Command {
	return { name: 'test', payload } as unknown as Command;
}

describe('promotion scope deltas', () => {
	it('drops blank and duplicate ids and omits an empty side', () => {
		expect(scopeDeltaRequest(command({ id: 'P1', add: ['C1', '', 'C1'], remove: [] }))).toEqual({
			id: 'P1', etag: undefined, add: ['C1'],
		});
	});

	it('names a picked product as a template or a variant, and removes selector rows by id', () => {
		const payload = { id: 'R1', add: ['T1'], remove: ['ROW1'] };

		expect(productDeltaRequest(command(payload), 'product_template_id')).toEqual({
			id: 'R1', etag: undefined, add: [{ product_template_id: 'T1' }], remove: ['ROW1'],
		});
		expect(productDeltaRequest(command({ id: 'R1', add: ['V1'] }), 'product_variant_id').add).toEqual([
			{ product_variant_id: 'V1' },
		]);
	});
});

describe('order promotion requests', () => {
	it('trims the code and sends replace_existing only when confirmed', () => {
		expect(applyVoucherRequest(command({ id: 'O1', code: ' SALE10 ' }))).toEqual({
			id: 'O1', etag: undefined, code: 'SALE10',
		});
		expect(applyVoucherRequest(command({ id: 'O1', code: 'X', replace_existing: true })).replace_existing).toBe(true);
	});

	it('sends either a reward or a decline, never both', () => {
		expect(selectRewardRequest(command({ id: 'O1', promotion_id: 'P1', reward_id: 'W1' }))).toEqual({
			id: 'O1', etag: undefined, promotion_id: 'P1', reward_id: 'W1',
		});
		expect(selectRewardRequest(command({ id: 'O1', promotion_id: 'P1', reward_id: 'W1', decline: true })))
			.toEqual({ id: 'O1', etag: undefined, promotion_id: 'P1', decline: true });
	});
});

describe('voucher batch request', () => {
	it('caps the quantity at 1000 and omits blank optional fields', () => {
		expect(generateBatchRequest(command({ promotion_id: 'P1', quantity: 5000, prefix: '', usage_limit: '3' })))
			.toEqual({ promotion_id: 'P1', quantity: 1000, usage_limit: 3 });
	});
});
