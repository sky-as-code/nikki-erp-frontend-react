import { withLeadingField } from '@nikkierp/ui/components/ExcelDataTable';

import type * as dyn from '@nikkierp/common/dynamicModel';
import type { ExcelDataTableCapability } from '@nikkierp/ui/components/ExcelDataTable';


/**
 * A form table pages its rows 100 at a time, a size fixed for every form table rather than the one
 * the user last picked on a list. Below the backend's `MODEL_RULE_PAGE_MAX_SIZE` of 500.
 */
export const FORM_DATA_TABLE_PAGE_SIZE = 100;

/** Pagination appears only when the rows do not fit on one page. */
export function isFormDataTablePaginated(total: number | undefined): boolean {
	return (total ?? 0) > FORM_DATA_TABLE_PAGE_SIZE;
}

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

/** The first page the table asks for; the insert row's search column is always projected, and first. */
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
