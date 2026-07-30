import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';


/**
 * Trimmed to the entries that actually route. The previous tree was placeholder
 * scaffolding ("Management lvl 2.2.1", …) with hardcoded English labels; menu items
 * now carry i18n keys, and inventing keys for placeholders is not worth it.
 */
const ITEMS: MenuItem[] = [
	{ labelKey: 'menu_orgHome', link: '/org-home' },
	{ labelKey: 'menu_moduleManagement', link: '/module-management' },
];

export function buildEssentialMenu(slug: string): MenuContribution {
	return { slug, translationNs: 'essential', items: ITEMS };
}
