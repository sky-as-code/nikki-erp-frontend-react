import { ClientErrorItem } from '@nikkierp/common/types';

import type { ExcelDataTableCapability, RowId, SearchItem } from './types';
import type { CommandBusResponse } from '@nikkierp/common/commandBus';


export type RowDeletePayload = { ids: RowId[] };

/**
 * `explained` is a failure someone else already told the user about: a permission refusal, which
 * the app-wide locked-feature modal shows, or a page callback resolving `false`, whose page owns
 * its message. `failed` carries whatever the write said, possibly nothing.
 */
export type RowDeleteOutcome =
	| { status: 'deleted' }
	| { status: 'explained' }
	| { status: 'failed', messages: string[] };

export function buildRowDeletePayload(rowId: RowId): RowDeletePayload {
	return { ids: [rowId] };
}

/**
 * Only a row carrying its own record id can be deleted through a command; a row keyed by its index
 * would delete whatever record the index happens to name. A page callback receives the row itself.
 */
export function deletableRowId(item: SearchItem): RowId | undefined {
	const id = item.id;
	return typeof id === 'string' || typeof id === 'number' ? id : undefined;
}

export function rowDeleteOutcome(response: CommandBusResponse<unknown>): RowDeleteOutcome {
	const clientErrors = response.result?.clientErrors ?? [];
	if (response.error == null && clientErrors.length === 0) {
		return { status: 'deleted' };
	}
	if (response.error == null && clientErrors.every(error => ClientErrorItem.isAuthorizationError(error))) {
		return { status: 'explained' };
	}
	const messages = clientErrors.map(error => error.message || error.key).filter(Boolean);
	if (messages.length === 0 && response.error instanceof Error && response.error.message) {
		messages.push(response.error.message);
	}
	return { status: 'failed', messages };
}

export type RowDeleteState = { isEditing: boolean, isLoading: boolean, isDeleting: boolean };

export function isRowDeleteShown(capabilities: ExcelDataTableCapability[]): boolean {
	return capabilities.includes('delete');
}

/** A delete never runs beside an open row editor, a pending load, or another delete of the row. */
export function isRowDeleteDisabled(state: RowDeleteState): boolean {
	return state.isEditing || state.isLoading || state.isDeleting;
}
