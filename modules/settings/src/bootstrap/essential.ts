import { PageNode } from '@nikkierp/viewengine/metadata';

import { buildCurrencyPages } from '../pages/essential/currency';
import { buildLanguagePages } from '../pages/essential/language';


/** The settings route of the Languages page (menu Translations → Languages). */
export const LANGUAGES_ROUTE = 'languages';
/** The settings route of the Currencies page, the one home of the currency catalogue. */
export const CURRENCIES_ROUTE = 'essential/essential_currency';

/**
 * Language and currency pages proxied from the essential micro-app, which keeps their schemas,
 * services and commands: Settings registers none of them.
 */
export function buildEssentialPages(): PageNode[] {
	return [...buildLanguagePages(LANGUAGES_ROUTE), ...buildCurrencyPages(CURRENCIES_ROUTE)];
}
