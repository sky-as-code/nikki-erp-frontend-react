import { buildInventoryMenu } from './inventory';
import { buildPurchaseMenu } from './purchase';
import { buildSalesMenu } from './sales';

import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';


/**
 * One menu for the whole module, with a top-level group per sub-module.
 *
 * A contribution carries a single `translationNs`, so the sub-module keys are re-homed in the
 * `commerce` namespace as `<sub>_<originalKey>` (e.g. `inventory_menu_stock`, `sales_menu.orders`);
 * the sub-module menus keep their own namespaces and keys untouched.
 */
export function buildCommerceMenu(slug: string): MenuContribution {
	return {
		slug,
		translationNs: 'commerce',
		items: [
			subModuleGroup('inventory', buildInventoryMenu(slug).items),
			subModuleGroup('purchase', buildPurchaseMenu(slug).items),
			subModuleGroup('sales', buildSalesMenu(slug).items),
		],
	};
}

function subModuleGroup(subModule: string, items: MenuItem[]): MenuItem {
	return { labelKey: `group_${subModule}`, items: prefixLabelKeys(subModule, items) };
}

function prefixLabelKeys(subModule: string, items: MenuItem[]): MenuItem[] {
	return items.map(item => ({
		...item,
		labelKey: `${subModule}_${item.labelKey}`,
		items: item.items ? prefixLabelKeys(subModule, item.items) : undefined,
	}));
}
