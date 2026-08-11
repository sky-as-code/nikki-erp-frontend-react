import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';


/** Keys live in the `inventory` namespace, alongside the module's other labels. */
const ITEMS: MenuItem[] = [
	{ labelKey: 'menu_overview', link: '/overview' },
	{ labelKey: 'menu_products', link: '/products' },
	{ labelKey: 'menu_variants', link: '/product-variants' },
	// Not under Configuration: prices are revised continually, unlike the master data below.
	{ labelKey: 'menu_prices', link: '/product-prices' },
	{
		// Master data a product references. Grouped because these are configured once and then
		// mostly read, unlike the products themselves.
		labelKey: 'menu_configuration',
		items: [
			{ labelKey: 'menu_productTypes', link: '/product-types' },
			{ labelKey: 'menu_productCategories', link: '/product-categories' },
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
