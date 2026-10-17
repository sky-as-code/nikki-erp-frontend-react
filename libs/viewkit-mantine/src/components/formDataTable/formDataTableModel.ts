import { withLeadingField } from '@nikkierp/ui/components/ExcelDataTable';

import type * as dyn from '@nikkierp/common/dynamicModel';
import type { ExcelDataTableCapability } from '@nikkierp/ui/components/ExcelDataTable';


/**
 * A form table shows every row of its record at once: there is no pagination to reach the rest.
 * The backend's `MODEL_RULE_PAGE_MAX_SIZE` caps a search page at 500 and refuses a larger size.
 */
export const FORM_DATA_TABLE_PAGE_SIZE = 500;

const readOnly: ExcelDataTableCapability[] = [];

/**
 * What the table may do in the form's current mode. Read mode is an empty list rather than
 * `undefined`: undefined plus an `updateCommand` is the table's legacy inline update, which a form
 * in read mode must not offer.
 */
export function formDataTableCapabilities(
	updateMode: boolean, capabilities: ExcelDataTableCapability[] | undefined,
): ExcelDataTableCapability[] | undefined {
	return updateMode ? capabilities : readOnly;
}

/** The one search the table runs; the insert row's search column is always projected, and first. */
export function formDataTableRequest(
	fields: string[], newRowSearchField: string | undefined, searchName?: string,
): dyn.RestSearchRequest {
	return {
		page: 0,
		size: FORM_DATA_TABLE_PAGE_SIZE,
		search_name: searchName,
		fields: withLeadingField(fields, newRowSearchField),
	};
}
