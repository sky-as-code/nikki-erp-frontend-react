import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';


/**
 * Trimmed to the entries that actually route. The previous tree was placeholder
 * scaffolding ("Management lvl 2.2.1", …) with hardcoded English labels; menu items
 * now carry i18n keys, and inventing keys for placeholders is not worth it.
 */
const ITEMS: MenuItem[] = [
	{ labelKey: 'nikki.essential.menu.orgHome', link: '/org-home' },
	{ labelKey: 'nikki.essential.menu.moduleManagement', link: '/module-management' },
];

export function buildEssentialMenu(slug: string): MenuContribution {
	return { slug, translationNs: 'common', items: ITEMS };
}
