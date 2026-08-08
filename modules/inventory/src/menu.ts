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
	{
		labelKey: 'menu_unit',
		items: [
			{ labelKey: 'menu_units', link: '/units' },
			{ labelKey: 'menu_unitCategories', link: '/unit-categories' },
		],
	},
];

export function buildInventoryMenu(slug: string): MenuContribution {
	return { slug, translationNs: 'inventory', items: ITEMS };
}
