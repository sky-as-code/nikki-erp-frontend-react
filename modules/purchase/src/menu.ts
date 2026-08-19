import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';


/**
 * Keys live in the `purchase` namespace, alongside the module's other labels, and must exist in the
 * backend's langJson files for both locales — a missing key renders as the raw `namespace:key`,
 * because there is deliberately no fallback locale. All five below were written in [PUR-013].
 *
 * Exactly five top-level entries, which is what the Shell renders before collapsing the rest into
 * an overflow menu — so a sixth sibling would push whichever came last out of sight.
 *
 * Requests for Quotation and Purchase Orders are the SAME resource, not two (PUR-R1): an order
 * starts at `rfq` and becomes a `purchase_order` on confirmation. They are two entry points into
 * one listing page, distinguished by a status filter in the route, the way Inventory's
 * cycle-count worklist is the balance list filtered by date. RFQ comes first because that is
 * where an order is raised.
 *
 * Links use `_` between words, matching the route paths in `pages/`. Nothing validates that a link
 * resolves to a declared route, so the two are kept in step by hand — and `pages.test.ts` pins the
 * route list so a rename that misses this file is at least visible there.
 */
const ITEMS: MenuItem[] = [
	{ labelKey: 'menu_overview', link: '/overview' },
	{ labelKey: 'menu_requestsForQuotation', link: '/requests_for_quotation' },
	{ labelKey: 'menu_orders', link: '/purchase_orders' },
	{ labelKey: 'menu_agreements', link: '/agreements' },
	// Configuration is the module's approval settings — one record per organization, configured
	// once and then mostly read.
	{ labelKey: 'menu_configuration', link: '/configuration' },
	// No entry for order lines, agreement lines, sourcing groups or audit events. Lines are
	// related records of the document that owns them; a sourcing group is created by adding an
	// alternative and reaped when fewer than two remain (§28), so it has no page to offer; and the
	// audit trail is read from the document whose history it records.
];

export function buildPurchaseMenu(slug: string): MenuContribution {
	return { slug, translationNs: 'purchase', items: ITEMS };
}
