import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';


/** Keys live in the `inventory` namespace, alongside the module's other labels. */
const ITEMS: MenuItem[] = [
	{ labelKey: 'menu_overview', link: '/overview' },
	{
		labelKey: 'menu_product',
		items: [
			{ labelKey: 'menu_products', link: '/products' },
			{ labelKey: 'menu_productCategories', link: '/product-categories' },
			{ labelKey: 'menu_variants', link: '/product-variants' },
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
