import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';


/**
 * Keys live in the `paymentinvoice` namespace, alongside the module's other labels, and must exist
 * in the backend's langJson files for both locales — a missing key renders as the raw
 * `namespace:key`, because there is deliberately no fallback locale.
 *
 * Three top-level entries, well inside the five the Shell renders before collapsing the rest into
 * an overflow menu.
 *
 * Links use `_` between words, matching the route paths in `pages/`. Nothing validates that a link
 * resolves to a declared route, so the two are kept in step by hand — and `pages.test.ts` pins the
 * route list so a rename that misses this file is at least visible there.
 */
const ITEMS: MenuItem[] = [
	// Orders first: it is the record of money actually moving, and the entry point for the
	// question this module most often has to answer — did this payment go through.
	{ labelKey: 'menu_orders', link: '/orders' },
	// Transactions is the same money seen per movement rather than per order, which is the way in
	// when the question starts from a gateway reference.
	{ labelKey: 'menu_transactions', link: '/transactions' },
	{ labelKey: 'menu_invoices', link: '/invoices' },
	// No entry for payment methods: they are configuration a deployment sets up once, and they
	// have no page. They are reached through the relation selects on an order.
];

export function buildPaymentInvoiceMenu(slug: string): MenuContribution {
	return { slug, translationNs: 'paymentinvoice', items: ITEMS };
}
