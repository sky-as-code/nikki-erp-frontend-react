import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';


/**
 * Keys live in the `inventory` namespace, alongside the module's other labels.
 *
 * Four top-level entries, deliberately: the Shell renders only the first
 * `MAX_VISIBLE_HORIZONTAL_ITEMS` (5) and collapses the rest into an overflow menu, so a fifth
 * sibling would push whichever came last out of sight.
 *
 * Links use `_` between words, matching the route paths in `pages/`. Nothing validates that a
 * link resolves to a declared route, so the two are kept in step by hand.
 */
const ITEMS: MenuItem[] = [
	{ labelKey: 'menu_overview', link: '/overview' },
	{
		// A variant is the concrete, transactable form of a template, so the two belong together
		// rather than as siblings of everything else.
		labelKey: 'menu_products',
		items: [
			{ labelKey: 'menu_productTemplates', link: '/products' },
			{ labelKey: 'menu_productVariants', link: '/product_variants' },
		],
	},
	{
		// A group from the outset: adjustments and scrap join it in later phases.
		// Stock carries no Products entry — product management has one home, above.
		labelKey: 'menu_stock',
		items: [
			{ labelKey: 'menu_stockTransfers', link: '/stock_transfers' },
			{ labelKey: 'menu_stockBalance', link: '/stock_balance' },
			{ labelKey: 'menu_stockLocations', link: '/stock_locations' },
		],
	},
	{
		// Master data a product references. Grouped because these are configured once and then
		// mostly read, unlike the products themselves.
		labelKey: 'menu_configuration',
		items: [
			{ labelKey: 'menu_prices', link: '/product_prices' },
			{ labelKey: 'menu_productTypes', link: '/product_types' },
			{ labelKey: 'menu_productCategories', link: '/product_categories' },
			{ labelKey: 'menu_brands', link: '/brands' },
			{ labelKey: 'menu_attributes', link: '/attributes' },
		],
	},
	// Units of measure are configured in the Essential module (BR-UOM-ESS-022,
	// AC-UOM-32), which owns the `essential_uom` / `essential_uomcat` resources. The
	// entries that used to live here pointed at hand-written pages calling
	// `{orgId}/inventory/units`, an endpoint the backend never served for those models.
];

export function buildInventoryMenu(slug: string): MenuContribution {
	return { slug, translationNs: 'inventory', items: ITEMS };
}
