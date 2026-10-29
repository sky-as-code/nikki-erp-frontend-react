import { showClientErrorModal } from '@nikkierp/common/service';

import type { ClientErrorItem, ClientErrorTranslator } from '@nikkierp/common/types';


/** Lands the server errors it can on their form inputs and returns the rest; a form runtime's `setServerErrors`. */
export type ServerErrorSink = (clientErrors: ClientErrorItem[]) => ClientErrorItem[];

/** Whether a section of the page shows the errors under this `field` itself (`ownsErrorField`). */
export type SectionErrorOwner = (field: string) => boolean;

/**
 * Lands each server error on its input through `attach`, and shows the rest in one error modal:
 * those with no `field`, and those naming a field the form does not show. With no form to attach
 * to (`attach` unset), every error goes to the modal. Errors a section shows itself are skipped.
 *
 * Authorization errors are not shown: the request layer already raised its modal for them.
 */
export function publishServerErrors(
	t: ClientErrorTranslator, errors: ClientErrorItem[], attach?: ServerErrorSink, sectionOwns?: SectionErrorOwner,
): void {
	const unowned = sectionOwns ? errors.filter(item => !item.field || !sectionOwns(item.field)) : errors;
	if (unowned.length === 0) {
		return;
	}
	showClientErrorModal(t, attach ? attach(unowned) : unowned);
}
