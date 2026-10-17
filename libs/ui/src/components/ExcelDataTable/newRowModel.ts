import { isRowCreatableField } from './editModel';

import type { NewRowConfig } from './context';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type { ClientErrorItem } from '@nikkierp/common/types';


/** `*` is the contains operator; see `SearchOperator` in `@nikkierp/common/dynamicModel`. */
const CONTAINS = '*';
const SEARCH_PAGE_SIZE = 20;

/**
 * Which columns of the insert row take an input, and how.
 *
 * `autoFields` render the schema's own `AutoField` and are validated by it; `editorFields` belong to
 * a page-supplied editor, which owns their values and their meaning; `searchField` is the record
 * picker of a `server-resource` row, the only input such a row has.
 */
export type NewRowColumns = {
	autoFields: string[],
	editorFields: string[],
	searchField: string | undefined,
	/** Every column with an input, in display order. */
	editable: string[],
};

export function resolveNewRowColumns(
	modelSchema: dyn.ModelSchema | undefined, fields: string[], newRow: NewRowConfig,
): NewRowColumns {
	if (newRow.source === 'server-resource') {
		const searchField = newRow.searchField && fields.includes(newRow.searchField) ? newRow.searchField : undefined;
		return { autoFields: [], editorFields: [], searchField, editable: searchField ? [searchField] : [] };
	}
	const editable = fields.filter(field => newRow.fieldEditors[field] || isRowCreatableField(modelSchema, field));
	return {
		autoFields: editable.filter(field => !newRow.fieldEditors[field]),
		editorFields: editable.filter(field => Boolean(newRow.fieldEditors[field])),
		searchField: undefined,
		editable,
	};
}

/** Nothing typed: absent, blank text, or an empty list or object (a LangJson with no entry). */
export function isEmptyNewRowValue(value: unknown): boolean {
	if (value === undefined || value === null) {
		return true;
	}
	if (typeof value === 'string') {
		return value.trim() === '';
	}
	if (Array.isArray(value)) {
		return value.length === 0;
	}
	if (typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
		return Object.keys(value).length === 0;
	}
	return false;
}

/**
 * The create payload: the inputs' values, without the optional ones left empty, so the server
 * applies its defaults rather than receiving an explicit blank.
 *
 * A required field is kept even when empty, so the server's own refusal names it. An editor's value
 * is passed through as given: `null` can be a meaningful choice there (e.g. "all actions").
 */
export function buildNewRowPayload(
	values: Record<string, unknown>, columns: NewRowColumns, modelSchema: dyn.ModelSchema | undefined,
): Record<string, unknown> {
	const payload: Record<string, unknown> = {};
	for (const field of columns.editorFields) {
		if (values[field] !== undefined) {
			payload[field] = values[field];
		}
	}
	for (const field of columns.autoFields) {
		const required = Boolean(modelSchema?.fields[field]?.is_required_for_create);
		if (required || !isEmptyNewRowValue(values[field])) {
			payload[field] = values[field];
		}
	}
	if (columns.searchField && !isEmptyNewRowValue(values[columns.searchField])) {
		payload[columns.searchField] = values[columns.searchField];
	}
	return payload;
}

/**
 * Splits a write's rejections into those an input of the row can show and the rest. A field the
 * row has no input for would otherwise be attached to the form invisibly and the refusal lost.
 */
export function splitNewRowErrors(
	errors: ClientErrorItem[], inputFields: string[],
): { attached: ClientErrorItem[], unattached: ClientErrorItem[] } {
	const attached: ClientErrorItem[] = [];
	const unattached: ClientErrorItem[] = [];
	for (const error of errors) {
		(error.field && inputFields.includes(error.field) ? attached : unattached).push(error);
	}
	return { attached, unattached };
}

/** Misconfigurations of the insert row that `findCapabilityConfigErrors` cannot see. */
export function findNewRowConfigProblems(
	modelSchema: dyn.ModelSchema | undefined, fields: string[], newRow: NewRowConfig,
): string[] {
	const problems: string[] = [];
	if (!modelSchema) {
		problems.push('the insert row needs modelSchema');
	}
	for (const field of Object.keys(newRow.fieldEditors)) {
		if (!fields.includes(field)) {
			problems.push(`newRowFieldEditors['${field}'] is not a displayed column`);
		}
	}
	if (newRow.source === 'server-resource') {
		if (newRow.searchField && !fields.includes(newRow.searchField)) {
			problems.push(`newRowSearchField '${newRow.searchField}' is not a displayed column`);
		}
		if (Object.keys(newRow.fieldEditors).length > 0) {
			problems.push(`newRowFieldEditors are ignored with newRowSource 'server-resource'`);
		}
	}
	return problems;
}

/** One page of records whose label contains the term, as `newRowSearchCommand` receives it. */
export function buildContainsSearchRequest(
	term: string, labelField: string, subLabelField?: string,
): dyn.RestSearchRequest {
	const fields = Array.from(new Set(['id', labelField, ...(subLabelField ? [subLabelField] : [])]));
	const trimmed = term.trim();
	return {
		page: 0,
		size: SEARCH_PAGE_SIZE,
		fields,
		// Searching by id would be a prefix match on an opaque ULID, which no user types.
		graph: trimmed && labelField !== 'id' ? { if: [labelField, CONTAINS, trimmed] } : undefined,
	};
}
