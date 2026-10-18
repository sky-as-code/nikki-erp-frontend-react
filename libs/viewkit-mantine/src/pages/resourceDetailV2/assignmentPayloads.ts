import type { CommandBusResponse } from '@nikkierp/common/commandBus';
import type { ClientErrorItem } from '@nikkierp/common/types';


/** What an assignment's `manageCommand` is published with: `id` is the page's own record. */
export type ManageDelta = { id: string, add?: string[], remove?: string[] };

export function buildAssignPayload(parentId: string, pickedId: string): ManageDelta {
	return { id: parentId, add: [pickedId] };
}

/** Deduplicated, and without rows that carry no id, which the backend could only reject. */
export function buildRemovePayload(parentId: string, rows: Array<Record<string, unknown>>): ManageDelta {
	const ids = rows
		.map(row => row.id)
		.filter((id): id is string | number => (typeof id === 'string' && id !== '') || typeof id === 'number')
		.map(String);
	return { id: parentId, remove: Array.from(new Set(ids)) };
}

/**
 * The column holding the insert row's record picker: the declared one, else the tab's first field.
 * `id` is the last resort only: the table shows the picker's column, so `id` would add one.
 */
export function assignmentSearchField(newRowSearchField: string | undefined, fields: string[] | undefined): string {
	return newRowSearchField ?? fields?.[0] ?? 'id';
}

/** The picked record: the insert row's picker writes the record id as its column's value. */
export function pickedRecordId(values: Record<string, unknown>, searchField: string): string | null {
	const value = values[searchField];
	return typeof value === 'string' && value !== '' ? value : null;
}

/**
 * The text to show for a failed command, or null when it succeeded. Plain text: the caller
 * escapes it before handing it to `showShellNotice`, which injects HTML.
 */
export function commandFailureMessage(response: CommandBusResponse<unknown>): string | null {
	if (response.error) {
		return errorText(response.error);
	}
	return clientErrorsText(response.result?.clientErrors ?? []);
}

function clientErrorsText(clientErrors: ClientErrorItem[]): string | null {
	if (clientErrors.length === 0) {
		return null;
	}
	return clientErrors.map(item => {
		const text = item.message || item.key;
		return item.field ? `${item.field}: ${text}` : text;
	}).join('; ');
}

function errorText(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
