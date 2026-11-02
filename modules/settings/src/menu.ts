import { CURRENCIES_ROUTE, LANGUAGES_ROUTE } from './bootstrap/essential';
import { SETTINGS_MODULE } from './constants';

import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';


/**
 * The settings menubar: the settings panes (the index route), the currencies and the translation catalogues.
 * Settings is still reached from Module Home; the menu only moves between its pages.
 */
const ITEMS: MenuItem[] = [
	{ labelKey: 'settings.menu.general', link: '/' },
	{ labelKey: 'settings.menu.currencies', link: `/${CURRENCIES_ROUTE}` },
	{
		labelKey: 'settings.menu.translations',
		items: [
			{ labelKey: 'settings.menu.languages', link: `/${LANGUAGES_ROUTE}` },
		],
	},
];

export function buildSettingsMenu(slug: string): MenuContribution {
	return { slug, translationNs: SETTINGS_MODULE, items: ITEMS };
}
