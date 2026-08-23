import { SETTINGS_MODULE } from './constants';

import type { MenuContribution, MenuItem } from '@nikkierp/ui/menu';


/**
 * No main-menu items: the settings page is reached from Module Home (D11).
 *
 * The contribution is still registered, with an empty list, rather than skipped entirely. The
 * menu registry is keyed by slug and has no notion of a launcher-only module, so registering
 * nothing and registering nothing-to-show are indistinguishable to it -- but they are not to a
 * reader, and an explicit empty list is what says the absence is a decision.
 *
 * This replaced a placeholder entry that existed only because nothing listed settings in Module
 * Home; the card in the shell's module list now does.
 */
const ITEMS: MenuItem[] = [];

export function buildSettingsMenu(slug: string): MenuContribution {
	return { slug, translationNs: SETTINGS_MODULE, items: ITEMS };
}
