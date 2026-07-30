import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';


const ITEMS: MenuItem[] = [
	{ labelKey: 'nikki.inventory.menu.overview', link: '/overview' },
	{
		labelKey: 'nikki.inventory.menu.product',
		items: [
			{ labelKey: 'nikki.inventory.menu.products', link: '/products' },
			{ labelKey: 'nikki.inventory.menu.productCategories', link: '/product-categories' },
			{ labelKey: 'nikki.inventory.menu.productVariants', link: '/product-variants' },
		],
	},
	{
		labelKey: 'nikki.inventory.menu.unit',
		items: [
			{ labelKey: 'nikki.inventory.menu.units', link: '/units' },
			{ labelKey: 'nikki.inventory.menu.unitCategories', link: '/unit-categories' },
		],
	},
];

export function buildInventoryMenu(slug: string): MenuContribution {
	return { slug, translationNs: 'common', items: ITEMS };
}
