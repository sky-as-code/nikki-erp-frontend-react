import type {
	PromotionOutcome, PromotionQuote, PromotionQuoteProgram, PromotionQuoteWarning,
} from '../../../../features/sales/salesOrder/promotionQuote';
import type { ClientErrorItem } from '@nikkierp/common/types';


/** Reason codes the locale files carry under `promotion.reason.*`; anything else reads the generic text. */
export const KNOWN_REASONS = new Set([
	'context_required', 'scope_mismatch', 'not_available', 'condition_not_met', 'pricelist_mismatch',
	'no_shipping_line', 'order_discount_not_best', 'zero_benefit', 'customer_required', 'usage_exhausted',
	'voucher_usage_exhausted', 'voucher_customer_mismatch', 'voucher_required',
]);

/** Warning codes the locale files carry under `promotion.warning.*`, with or without that prefix. */
export const KNOWN_WARNINGS = new Set(['context_required', 'coupon_needs_customer', 'mixed_uom']);

const KNOWN_OUTCOMES = new Set<PromotionOutcome>([
	'applied', 'selection_required', 'declined', 'not_eligible', 'not_applicable',
]);

export const OUTCOME_COLORS: Record<string, string> = {
	applied: 'green',
	selection_required: 'orange',
	declined: 'gray',
	not_eligible: 'yellow',
	not_applicable: 'gray',
	unknown: 'gray',
};

/** One program row of the panel, already decided: the component only renders it. */
export type ProgramView = {
	promotionId: string,
	title: string,
	reference?: string,
	voucherCode?: string,
	outcome: PromotionOutcome | 'unknown',
	outcomeKey: string,
	reasonKey?: string,
	rewards: { rewardId: string, label: string, selected: boolean }[],
	/** A reward choice is offered: several rewards, or one the cashier may decline. */
	canChoose: boolean,
	canDecline: boolean,
	isDeclined: boolean,
	discountTotal: string,
	hasDiscount: boolean,
	affectedLineCount: number,
	gift?: { productVariantId: string, quantity: string },
};

export function outcomeKeyOf(outcome: string): string {
	return KNOWN_OUTCOMES.has(outcome as PromotionOutcome) ? `promotion.outcome.${outcome}` : 'promotion.outcome.unknown';
}

/** `promotion.reason.<code>` for a code the locales know, the generic reason otherwise; none without a code. */
export function reasonKeyOf(reason: string | undefined | null): string | undefined {
	if (!reason) {
		return undefined;
	}
	return KNOWN_REASONS.has(reason) ? `promotion.reason.${reason}` : 'promotion.reason.unknown';
}

export function warningKeyOf(warning: PromotionQuoteWarning): string {
	const code = warning.code.replace(/^(sales:)?promotion\.warning\./, '');
	return KNOWN_WARNINGS.has(code) ? `promotion.warning.${code}` : 'promotion.warning.unknown';
}

function isPositive(amount: string | undefined): boolean {
	const value = Number(amount ?? 0);
	return Number.isFinite(value) && value > 0;
}

export function programView(program: PromotionQuoteProgram): ProgramView {
	const outcome = KNOWN_OUTCOMES.has(program.outcome) ? program.outcome : 'unknown';
	const rewards = (program.rewards ?? []).map(reward => ({
		rewardId: reward.reward_id,
		label: reward.order_description || reward.reward_type,
		selected: Boolean(reward.selected),
	}));
	const choosable = outcome === 'applied' || outcome === 'selection_required' || outcome === 'declined';
	const hasGiftReward = (program.rewards ?? []).some(reward => reward.reward_type === 'free_product');
	return {
		promotionId: program.promotion_id,
		title: program.name || program.reference || program.promotion_id,
		reference: program.reference,
		voucherCode: program.voucher_code,
		outcome,
		outcomeKey: outcomeKeyOf(outcome),
		reasonKey: reasonKeyOf(program.reason_code),
		rewards,
		canChoose: choosable && rewards.length > 1,
		canDecline: (outcome === 'applied' || outcome === 'selection_required') && hasGiftReward,
		isDeclined: outcome === 'declined',
		discountTotal: program.discount_total_amount ?? '0',
		hasDiscount: isPositive(program.discount_total_amount),
		affectedLineCount: (program.affected_lines ?? []).length,
		gift: program.gift
			? { productVariantId: program.gift.product_variant_id, quantity: program.gift.quantity }
			: undefined,
	};
}

/** Applied first, then those waiting for a choice, then the rest; stable within a group. */
export function programViews(quote: PromotionQuote | null | undefined): ProgramView[] {
	const rank: Record<string, number> = { applied: 0, selection_required: 1, declined: 2 };
	return (quote?.programs ?? [])
		.map(programView)
		.map((view, index) => ({ view, index }))
		.sort((a, b) => ((rank[a.view.outcome] ?? 3) - (rank[b.view.outcome] ?? 3)) || a.index - b.index)
		.map(entry => entry.view);
}

/** The attached codes, one per voucher-gated promotion, for the chips above the program list. */
export function attachedVouchers(quote: PromotionQuote | null | undefined): { promotionId: string, code: string }[] {
	return (quote?.programs ?? [])
		.filter(program => Boolean(program.voucher_code))
		.map(program => ({ promotionId: program.promotion_id, code: program.voucher_code as string }));
}

export function isPromotionQuote(value: unknown): value is PromotionQuote {
	return typeof value === 'object' && value !== null
		&& typeof (value as PromotionQuote).calculation_reference === 'string'
		&& Array.isArray((value as PromotionQuote).programs);
}

/** The bare key of a client error: `sales:promotion.requote_required` → `promotion.requote_required`. */
export function bareErrorKey(item: Pick<ClientErrorItem, 'key'>): string {
	return item.key.replace(/^[a-z_]+:/, '');
}

export function findError<T extends Pick<ClientErrorItem, 'key'>>(errors: T[], bareKey: string): T | undefined {
	return errors.find(item => bareErrorKey(item) === bareKey);
}

/** The fresh quote a `requote_required` refusal carries in its details, directly or under `quote`. */
export function quoteFromError(item: Pick<ClientErrorItem, 'vars'> | undefined): PromotionQuote | null {
	const vars = item?.vars as Record<string, unknown> | undefined;
	if (!vars) {
		return null;
	}
	if (isPromotionQuote(vars)) {
		return vars;
	}
	return isPromotionQuote(vars.quote) ? vars.quote : null;
}
