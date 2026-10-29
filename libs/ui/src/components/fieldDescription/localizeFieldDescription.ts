import { LangJsonRefKey } from '@nikkierp/common/dynamicModel';

import type { LocalizeFn } from '../../i18n';
import type * as dyn from '@nikkierp/common/dynamicModel';


/**
 * A schema field's `description` as display text, or '' when it has none. A `$ref` that resolves
 * to its own key is a missing translation, not a description, so it reads as none rather than
 * putting a raw key in a tooltip.
 */
export function localizeFieldDescription(
	localize: LocalizeFn | null | undefined,
	description: dyn.ModelSchemaLangJson | string | null | undefined,
): string {
	if (!localize || !description) {
		return '';
	}
	const text = localize(description).trim();
	const refKey = typeof description === 'string' ? description : description[LangJsonRefKey];
	return text === refKey ? '' : text;
}
