import { PageNode } from '@nikkierp/viewengine/metadata';

import { buildCurrencyPages } from '../pages/essential/currency';
import { buildLanguagePages } from '../pages/essential/language';
import { buildSequencePages } from '../pages/essential/sequence';


/** The settings route of the Languages page (menu Translations → Languages). */
export const LANGUAGES_ROUTE = 'languages';
/** The settings route of the Currencies page, the one home of the currency catalogue. */
export const CURRENCIES_ROUTE = 'essential/essential_currency';
/**
 * The settings routes of the Sequence pages (menu Technical → Sequences). The definitions list is the entry; the
 * counters and issuances are reached from a definition, filtered by it, and link to each other through these.
 */
export const SEQUENCE_PAGE_ROUTES = Object.freeze({
	definition: 'essential/essential_sequence_definition',
	counter: 'essential/essential_sequence_counter',
	issuance: 'essential/essential_sequence_issuance',
});

/**
 * Language, currency and sequence pages proxied from the essential micro-app, which keeps their schemas,
 * services and commands: Settings registers none of them.
 */
export function buildEssentialPages(): PageNode[] {
	return [
		...buildLanguagePages(LANGUAGES_ROUTE),
		...buildCurrencyPages(CURRENCIES_ROUTE),
		...buildSequencePages(SEQUENCE_PAGE_ROUTES),
	];
}
