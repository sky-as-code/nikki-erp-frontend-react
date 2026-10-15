import type { MenuItem } from './types';


/**
 * The link a module opens on: the first sub-item of the first main item, found depth-first so a
 * main item that is itself a link counts, and a group nested several levels deep is walked into.
 */
export function findFirstMenuLink(items: readonly MenuItem[]): string | null {
	for (const item of items) {
		if (item.link) {
			return item.link;
		}
		const nested = item.items ? findFirstMenuLink(item.items) : null;
		if (nested) {
			return nested;
		}
	}
	return null;
}
