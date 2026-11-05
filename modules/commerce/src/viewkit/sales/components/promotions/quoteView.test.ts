import { describe, expect, it } from 'vitest';

import {
	attachedVouchers, bareErrorKey, findError, outcomeKeyOf, programView, programViews, quoteFromError, reasonKeyOf,
	warningKeyOf,
} from './quoteView';
import { childCreateHref, generatedCodesText, idsToAdd, parseGenerateResult } from '../promotionHelpers';

import type { PromotionQuote, PromotionQuoteProgram } from '../../../../features/sales/salesOrder/promotionQuote';


function program(overrides: Partial<PromotionQuoteProgram>): PromotionQuoteProgram {
	return {
		promotion_id: 'P1', name: 'Summer', reference: 'KM-1', program_type: 'automatic', outcome: 'applied',
		rewards: [], discount_untaxed_amount: '0', tax_reduction_amount: '0', discount_total_amount: '0',
		affected_lines: [], ...overrides,
	};
}

function quote(programs: PromotionQuoteProgram[]): PromotionQuote {
	return {
		calculation_reference: 'REF', calculated_at: '2026-11-05T00:00:00Z', order_revision: 1,
		promotion_config_versions: {}, programs,
		totals: { subtotal: '100', discount_total: '10', tax_total: '9', grand_total: '99' }, warnings: [],
	};
}

describe('promotion outcome view model', () => {
	it('keys known outcomes and reasons, and falls back to a generic text for unknown codes', () => {
		expect(outcomeKeyOf('applied')).toBe('promotion.outcome.applied');
		expect(outcomeKeyOf('exploded')).toBe('promotion.outcome.unknown');
		expect(reasonKeyOf('pricelist_mismatch')).toBe('promotion.reason.pricelist_mismatch');
		expect(reasonKeyOf('order_discount_not_best')).toBe('promotion.reason.order_discount_not_best');
		expect(reasonKeyOf('something_new')).toBe('promotion.reason.unknown');
		expect(reasonKeyOf(undefined)).toBeUndefined();
	});

	it('maps warning codes with or without their prefix', () => {
		expect(warningKeyOf({ code: 'promotion.warning.context_required' })).toBe('promotion.warning.context_required');
		expect(warningKeyOf({ code: 'coupon_needs_customer' })).toBe('promotion.warning.coupon_needs_customer');
		expect(warningKeyOf({ code: 'sales:promotion.warning.mixed_uom' })).toBe('promotion.warning.mixed_uom');
		expect(warningKeyOf({ code: 'brand_new' })).toBe('promotion.warning.unknown');
	});

});

describe('promotion program rows', () => {
	it('offers a reward choice only with several rewards, and a decline only for a gift', () => {
		const choice = programView(program({
			outcome: 'selection_required',
			rewards: [
				{ reward_id: 'W1', reward_type: 'discount', order_description: '10% off', selected: false },
				{ reward_id: 'W2', reward_type: 'free_product', order_description: 'Free cup', selected: true },
			],
		}));
		expect(choice.canChoose).toBe(true);
		expect(choice.canDecline).toBe(true);
		expect(choice.rewards.map(reward => reward.label)).toEqual(['10% off', 'Free cup']);

		const notEligible = programView(program({
			outcome: 'not_eligible', reason_code: 'condition_not_met',
			rewards: [{ reward_id: 'W1', reward_type: 'free_product', selected: false }],
		}));
		expect([notEligible.canChoose, notEligible.canDecline, notEligible.reasonKey])
			.toEqual([false, false, 'promotion.reason.condition_not_met']);
	});

	it('shows the amount and gift the engine computed, never a derived one', () => {
		const view = programView(program({
			discount_total_amount: '12.500000',
			affected_lines: [{ order_line_id: 'L1', discount_untaxed_amount: '10' }],
			gift: { product_variant_id: 'V1', uom_id: 'U1', quantity: '1', order_line_id: 'L2' },
		}));
		expect([view.hasDiscount, view.discountTotal, view.affectedLineCount]).toEqual([true, '12.500000', 1]);
		expect(view.gift).toEqual({ productVariantId: 'V1', quantity: '1' });
		expect(programView(program({ discount_total_amount: '0' })).hasDiscount).toBe(false);
	});

	it('lists applied programs first, then those awaiting a choice', () => {
		const views = programViews(quote([
			program({ promotion_id: 'A', outcome: 'not_eligible' }),
			program({ promotion_id: 'B', outcome: 'selection_required' }),
			program({ promotion_id: 'C', outcome: 'applied' }),
		]));
		expect(views.map(view => view.promotionId)).toEqual(['C', 'B', 'A']);
		expect(programViews(null)).toEqual([]);
	});

	it('lists the attached voucher codes', () => {
		expect(attachedVouchers(quote([program({ voucher_code: 'SALE10' }), program({ promotion_id: 'P2' })])))
			.toEqual([{ promotionId: 'P1', code: 'SALE10' }]);
	});
});

describe('promotion client errors', () => {
	it('matches error keys with or without their namespace', () => {
		expect(bareErrorKey({ key: 'sales:promotion.requote_required' })).toBe('promotion.requote_required');
		expect(findError([{ key: 'sales:promotion.voucher_replace_required' }], 'promotion.voucher_replace_required'))
			.toBeDefined();
	});

	it('reads the fresh quote of a requote refusal, directly or under `quote`', () => {
		const fresh = quote([]);
		expect(quoteFromError({ vars: fresh as unknown as Record<string, unknown> })).toEqual(fresh);
		expect(quoteFromError({ vars: { quote: fresh } })).toEqual(fresh);
		expect(quoteFromError({ vars: { other: 1 } })).toBeNull();
		expect(quoteFromError(undefined)).toBeNull();
	});
});

describe('promotion admin helpers', () => {
	it('keeps only well-formed generated vouchers and copies one code per line', () => {
		const vouchers = parseGenerateResult({ count: 3, vouchers: [{ id: '1', code: 'A1' }, { id: 2 }, { id: '3', code: 'B2' }] });
		expect(generatedCodesText(vouchers)).toBe('A1\nB2');
		expect(parseGenerateResult(null)).toEqual([]);
	});

	it('adds only the current records not yet linked', () => {
		expect(idsToAdd(['C1', 'C2', 'C2', '', 'C3'], ['C3'])).toEqual(['C1', 'C2']);
	});

	it('pre-fills the promotion on the child create page', () => {
		expect(childCreateHref('/o/commerce/sales_promotion_rule', 'P1'))
			.toBe('/o/commerce/sales_promotion_rule/new?field_data=%7B%22promotion_id%22%3A%22P1%22%7D');
	});
});
