import { PageNode } from '@nikkierp/viewengine/metadata';

import { buildLanguagePages } from '../pages/essential/language';


/** The settings route of the Languages page (menu Translations → Languages). */
export const LANGUAGES_ROUTE = 'languages';

/**
 * Language pages proxied from the essential micro-app, which keeps the `essential_language` schema,
 * its service and its commands: Settings registers none of them.
 */
export function buildEssentialPages(): PageNode[] {
	return buildLanguagePages(LANGUAGES_ROUTE);
}
