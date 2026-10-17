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
 * The text to show for a failed command, or null when it succeeded. Plain text: the caller
 * escapes it before handing it to `showAsyncNotice`, which injects HTML.
 */
export function commandFailureMessage(response: CommandBusResponse<unknown>): string | null {
	if (response.error) {
		return errorText(response.error);
	}
	return clientErrorsText(response.result?.clientErrors ?? []);
}

/** A failed dropdown load: a technical error first, else whatever the server refused with. */
export function searchFailureMessage(loadError: string | undefined, clientErrors: ClientErrorItem[]): string | null {
	return loadError || clientErrorsText(clientErrors);
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
