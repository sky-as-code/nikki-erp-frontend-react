import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';


/**
 * Keys live in the `inventory` namespace, alongside the module's other labels.
 *
 * Five top-level entries, which is exactly what the Shell renders: it shows the first
 * `MAX_VISIBLE_HORIZONTAL_ITEMS` (5) and collapses the rest into an overflow menu, so a sixth
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
			{ labelKey: 'menu_products', link: '/inventory_product_template' },
			{ labelKey: 'menu_productVariants', link: '/inventory_product_variant' },
		],
	},
	{
		// Stock carries no Products entry — product management has one home, above.
		labelKey: 'menu_stock',
		items: [
			{ labelKey: 'menu_stockTransfers', link: '/inventory_stock_transfer' },
			{ labelKey: 'menu_stockBalance', link: '/inventory_stock_quant' },
			// The cycle-count worklist is the balance list filtered by next_count_date, so it is a
			// second entry point into an existing page rather than a page of its own (BR §4.2.8).
			{ labelKey: 'menu_stockCountsDue', link: '/stock_balance_counts_due' },
			{ labelKey: 'menu_stockScraps', link: '/inventory_stock_scrap' },
			// Warehouse-level holds taken by sales; released here when a demand is abandoned.
			{ labelKey: 'menu_stockReservations', link: '/inventory_stock_reservation' },
		],
	},
	{
		// Warehouse is topology and configuration: where goods may be kept and which routes are
		// permitted. It changes no quantity — Stock, above, is what moves things.
		labelKey: 'menu_warehouse',
		items: [
			{ labelKey: 'menu_warehouses', link: '/inventory_warehouse' },
			{ labelKey: 'menu_storageCategories', link: '/inventory_storage_category' },
			{ labelKey: 'menu_putawayRules', link: '/inventory_putaway_rule' },
			{ labelKey: 'menu_supplyRelations', link: '/inventory_warehouse_supply_relation' },
		],
	},
	{
		// Master data a product references. Grouped because these are configured once and then
		// mostly read, unlike the products themselves.
		labelKey: 'menu_configuration',
		items: [
			// Location is the module's shared location master rather than a stock-owned
			// resource, so it sits with the other things configured once and then referenced,
			// not under Stock where it used to live.
			{ labelKey: 'menu_locations', link: '/inventory_location' },
			{ labelKey: 'menu_productTypes', link: '/inventory_product_type' },
			{ labelKey: 'menu_productCategories', link: '/inventory_product_category' },
			{ labelKey: 'menu_brands', link: '/inventory_brand' },
			{ labelKey: 'menu_attributes', link: '/inventory_product_attribute' },
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
