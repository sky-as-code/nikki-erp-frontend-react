/**
 * What every draft-order promotion action answers (plan §3.2). Amounts are decimal strings, never
 * numbers: the engine rounds per currency and a float would drift from the stored totals.
 */
export type PromotionOutcome = 'applied' | 'selection_required' | 'declined' | 'not_eligible' | 'not_applicable';

export type PromotionQuoteReward = {
	reward_id: string,
	reward_type: string,
	order_description?: string,
	selected: boolean,
};

export type PromotionQuoteAffectedLine = {
	order_line_id: string,
	discount_untaxed_amount: string,
};

export type PromotionQuoteGift = {
	product_variant_id: string,
	uom_id: string,
	quantity: string,
	order_line_id?: string,
};

export type PromotionQuoteProgram = {
	promotion_id: string,
	reference?: string,
	name?: string,
	program_type: string,
	voucher_code?: string,
	outcome: PromotionOutcome,
	reason_code?: string,
	rewards: PromotionQuoteReward[],
	discount_untaxed_amount: string,
	tax_reduction_amount: string,
	discount_total_amount: string,
	affected_lines: PromotionQuoteAffectedLine[],
	gift?: PromotionQuoteGift,
};

export type PromotionQuoteTotals = {
	subtotal: string,
	discount_total: string,
	tax_total: string,
	grand_total: string,
};

export type PromotionQuoteWarning = {
	code: string,
	promotion_id?: string,
};

export type PromotionQuote = {
	calculation_reference: string,
	calculated_at: string,
	order_revision: number,
	promotion_config_versions: Record<string, number>,
	programs: PromotionQuoteProgram[],
	totals: PromotionQuoteTotals,
	warnings: PromotionQuoteWarning[],
};
