import { CURRENCIES_ROUTE, LANGUAGES_ROUTE, SEQUENCE_PAGE_ROUTES } from './bootstrap/essential';
import { SETTINGS_MODULE } from './constants';

import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';


/**
 * The settings menubar: the settings panes (the index route), the currencies, the translation catalogues and the
 * technical configuration. Settings is still reached from Module Home; the menu only moves between its pages.
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
	{
		labelKey: 'settings.menu.technical',
		items: [
			{
				labelKey: 'settings.menu.sequences',
				link: `/${SEQUENCE_PAGE_ROUTES.definition}`,
				// The page's own read (BR §9); counters and issuances are reached from it and check their own.
				requiredEntitlements: ['read:essential_sequence_definition:org'],
			},
		],
	},
];

export function buildSettingsMenu(slug: string): MenuContribution {
	return { slug, translationNs: SETTINGS_MODULE, items: ITEMS };
}
