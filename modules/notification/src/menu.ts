import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';


/**
 * Keys live in the `notification` namespace, alongside the module's other labels.
 *
 * One entry only: the module has exactly one page. The bell in the Shell header is the way in that
 * people actually use, and it is not a menu item — the menu registry only renders the ACTIVE
 * module's menu, so an entry there would be invisible from every other module.
 */
const ITEMS: MenuItem[] = [
	{ labelKey: 'menu.notifications', link: '/notification_notification' },
];

export function buildNotificationMenu(slug: string): MenuContribution {
	return {
		slug,
		translationNs: 'notification',
		items: ITEMS,
	};
}
