import type {
	AnyMenuContribution, MenuItem, RibbonDropdownItem, RibbonItem, RibbonMenuContribution,
} from './types';


export function isRibbonMenu(contribution: AnyMenuContribution): contribution is RibbonMenuContribution {
	return contribution.type === 'ribbon';
}

export function isRibbonDropdown(item: RibbonItem): item is RibbonDropdownItem {
	return 'items' in item && Array.isArray(item.items);
}

/**
 * A ribbon as a traditional item tree (tab → block → item → dropdown link), for the places that
 * only walk items: the mobile drawer and the module index redirect.
 */
export function ribbonToMenuItems(contribution: RibbonMenuContribution): MenuItem[] {
	return contribution.tabs.map(tab => ({
		labelKey: tab.labelKey,
		items: tab.blocks.map(block => ({
			labelKey: block.titleKey,
			items: block.items.map(ribbonItemToMenuItem),
		})),
	}));
}

/** The contribution's entries as an item tree, whatever its type. */
export function menuItemsOf(contribution: AnyMenuContribution): MenuItem[] {
	return isRibbonMenu(contribution) ? ribbonToMenuItems(contribution) : contribution.items;
}

function ribbonItemToMenuItem(item: RibbonItem): MenuItem {
	if (isRibbonDropdown(item)) {
		return { labelKey: item.labelKey, items: item.items.map(link => ({ ...link })) };
	}
	return { ...item };
}
