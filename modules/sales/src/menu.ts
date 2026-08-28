import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';


/**
 * Keys live in the `sales` namespace and must exist in the backend's langJson files for both
 * locales; there is no fallback locale, so a missing key renders as the raw `sales:menu.orders`.
 * Keys are dotted to match the namespace's existing contents, not the neighbouring modules.
 *
 * Five top-level entries is the ceiling: the Shell collapses the rest into an overflow menu, so a
 * sixth silently pushes the last one out of sight. Hence the Billing and Pricing groups.
 *
 * Links use `_` between words to match the route paths in `pages/`. Nothing validates that a link
 * resolves to a declared route; `pages.test.ts` pins the route list so a rename is at least visible.
 */
const ITEMS: MenuItem[] = [
	// Orders and quotations are different resources with separate tables and routes: a quotation
	// that never converts must not burn an order number, since fiscal systems read that sequence.
	{ labelKey: 'menu.orders', link: '/sales_orders' },
	{ labelKey: 'menu.quotations', link: '/sales_quotations' },
	{
		labelKey: 'menu.billing',
		items: [
			{ labelKey: 'menu.bills', link: '/sales_bills' },
			// Read-only: money is recorded through a bill's `pay` action, never by creating a row.
			{ labelKey: 'menu.payments', link: '/sales_payments' },
			// Read-mostly: the backend creates these; issuing one is an action on a bill.
			{ labelKey: 'menu.fiscalRequests', link: '/sales_fiscal_requests' },
		],
	},
	{
		labelKey: 'menu.pricing',
		items: [
			{ labelKey: 'menu.pricelists', link: '/sales_pricelists' },
			{ labelKey: 'menu.promotions', link: '/sales_promotion_programs' },
			{ labelKey: 'menu.combos', link: '/sales_combos' },
			{ labelKey: 'menu.voucherCodes', link: '/sales_voucher_codes' },
		],
	},
	{
		labelKey: 'menu.setup',
		items: [
			{ labelKey: 'menu.channels', link: '/sales_channels' },
			{ labelKey: 'menu.points', link: '/sales_points' },
		],
	},
	// Child records (order lines, adjustments, events, bill lines, combo components, pricelist
	// items, promotion rewards, redemptions, fulfilment requests) get no entry: each is shown on the
	// document that owns it. `sales_integration_outbox` gets none either — it is an at-least-once
	// delivery queue, and a screen inviting someone to correct a row would break that guarantee.
];

export function buildSalesMenu(slug: string): MenuContribution {
	return { slug, translationNs: 'sales', items: ITEMS };
}
