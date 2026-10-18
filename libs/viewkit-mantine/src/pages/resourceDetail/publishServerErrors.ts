import { notifyClientErrors } from '@nikkierp/common/service';

import type { ClientErrorItem, ClientErrorTranslator } from '@nikkierp/common/types';


/**
 * Sends every server error that has no `field` to the Shell Notice stack as an `error` notice and
 * returns the field-scoped ones, which the caller attaches to its form inputs.
 *
 * Authorization errors are not shown: the request layer already raised its modal for them.
 */
export function publishServerErrors(t: ClientErrorTranslator, errors: ClientErrorItem[]): ClientErrorItem[] {
	const fieldItems: ClientErrorItem[] = [];
	for (const item of errors) {
		if (item.field) {
			fieldItems.push(item);
			continue;
		}
		notifyServerError(t, item);
	}
	return fieldItems;
}

/** Sends one server error to the Shell Notice stack, whether or not it names a field. */
export function notifyServerError(t: ClientErrorTranslator, item: ClientErrorItem): void {
	notifyClientErrors(t, [item]);
}
