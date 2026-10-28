import { currentOrgSearchParams } from './orgContext';
import { get } from '../request/request';

import type { RequestResult } from '../request/request';


/** The audit log's per-record history, served by the `auditlog` module. */
export const RESOURCE_HISTORY_PATH = 'v1/auditlog/actions/history';

export type ResourceHistoryActorType = 'user' | 'service' | 'system';

export type ResourceHistoryActor = {
	id?: string | null,
	type: ResourceHistoryActorType,
	/** A snapshot taken when the action was logged, so a renamed or deleted user still reads as they were. */
	display_name?: string | null,
	avatar_file_id?: string | null,
};

export type ResourceHistoryChange = {
	/** A field, or an edge name for a many-to-many link (`roles`). */
	field: string,
	/** An edge field's value is an id, or an array of ids for a link or unlink. */
	old: unknown,
	new: unknown,
	/** For an edge field: the display label of each id in `old` and `new`, as far as the server knows it. */
	labels?: Record<string, string>,
};

export type ResourceHistoryItem = {
	id: string,
	/** `create`, `update`, `delete`, `archive`, `unarchive`, `link`, `unlink`, `get`, `search` or a custom action code. */
	action: string,
	created_at: string,
	request_id?: string | null,
	actor: ResourceHistoryActor,
	changes: ResourceHistoryChange[],
	/** Fields the caller may not read: their change values arrive as null. */
	masked_fields?: string[],
};

/** Newest first. */
export type ResourceHistoryResponse = {
	items: ResourceHistoryItem[],
	total: number,
	page: number,
	size: number,
};

export type ResourceHistoryRequest = {
	/** The target's schema name, e.g. `iam_user`. */
	resourceCode: string,
	resourceId: string,
	/** Zero-based, as every search of the dynamic resource engine pages. */
	page?: number,
	size?: number,
};

/**
 * One page of a record's audit history. The server authorizes it as a read of the target record, in
 * the current org, and masks the change values of fields the caller may not read.
 */
export async function fetchResourceHistory(
	request: ResourceHistoryRequest,
): Promise<RequestResult<ResourceHistoryResponse>> {
	const searchParams = new URLSearchParams(await currentOrgSearchParams());
	searchParams.set('resource_code', request.resourceCode);
	searchParams.set('resource_id', request.resourceId);
	if (request.page !== undefined) {
		searchParams.set('page', String(request.page));
	}
	if (request.size !== undefined) {
		searchParams.set('size', String(request.size));
	}
	return get<ResourceHistoryResponse>(RESOURCE_HISTORY_PATH, { searchParams });
}
