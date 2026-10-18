import { grantKey } from './permissionDrafts';

import type { DraftGrant, PermissionDrafts, RowRef } from './permissionDrafts';
import type { PermissionName } from '../../../features/role/rolePermissions';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type { SearchItem } from '@nikkierp/ui/components/ExcelDataTable';


export const RESOURCE_FIELD = 'resource_id';
export const ACTION_FIELD = 'action_id';
export const DESCRIPTION_FIELD = 'description';
export const PERMISSION_FIELDS = [RESOURCE_FIELD, ACTION_FIELD, DESCRIPTION_FIELD];

/** Marks a row the table shows for a draft grant; no server row carries it. */
export const DRAFT_ROW_FLAG = '$draft';

const DRAFT_ID_PREFIX = 'draft:';

/** The row editor refuses a row without an etag; a draft has none, and its edits never reach the server. */
const DRAFT_ETAG = 'draft';

/**
 * Saved rows sort on the server, so pages agree: by resource, then action. A null action (the
 * "All" grant) sorts last there; {@link allActionsFirst} moves it to the front of its resource.
 */
export const PERMISSION_ORDER: dyn.OrderBy = [['resource.name', 'asc'], ['action.name', 'asc']];

/**
 * The `record_label_field` of `iam_resource` and `iam_action`: a draft row carries its edges'
 * labels under it, so the table resolves them like a saved row's.
 */
const EDGE_LABEL_FIELD = 'name';

export type GrantProblem = { field: string, key: string };

export type GrantValues = { grant: DraftGrant, problem?: undefined } | { problem: GrantProblem };

export function isDraftRow(item: SearchItem | Record<string, unknown> | undefined): boolean {
	return item?.[DRAFT_ROW_FLAG] === true;
}

/** The row a draft grant shows as; its id stays stable while the draft lives. */
export function toDraftRow(grant: DraftGrant): SearchItem {
	return {
		id: `${DRAFT_ID_PREFIX}${grantKey(grant.resourceId, grant.actionId)}`,
		etag: DRAFT_ETAG,
		[DRAFT_ROW_FLAG]: true,
		[RESOURCE_FIELD]: grant.resourceId,
		[ACTION_FIELD]: grant.actionId,
		[DESCRIPTION_FIELD]: grant.description.trim(),
		resource: { id: grant.resourceId, [EDGE_LABEL_FIELD]: grant.resourceName },
		action: grant.actionId == null ? null : { id: grant.actionId, [EDGE_LABEL_FIELD]: grant.actionName },
	};
}

/**
 * The saved rows not marked for removal, with their edited descriptions and the "All" grant first
 * within each resource, then the drafts in the order they were added. Drafts join the sort only
 * once saved, when the table reloads.
 */
export function mergeDraftRows(items: SearchItem[], drafts: PermissionDrafts): SearchItem[] {
	const kept = items
		.filter(item => !drafts.removed.includes(item.id))
		.map(item => (item.id in drafts.updated ? { ...item, [DESCRIPTION_FIELD]: drafts.updated[item.id] } : item));
	return [...allActionsFirst(kept), ...drafts.added.map(toDraftRow)];
}

/** Moves each run of one resource's rows to start with its "All" grant, keeping the rest in order. */
export function allActionsFirst(items: SearchItem[]): SearchItem[] {
	const out: SearchItem[] = [];
	let start = 0;
	while (start < items.length) {
		let end = start;
		while (end < items.length && items[end][RESOURCE_FIELD] === items[start][RESOURCE_FIELD]) {
			end++;
		}
		const run = items.slice(start, end);
		out.push(...run.filter(item => item[ACTION_FIELD] == null), ...run.filter(item => item[ACTION_FIELD] != null));
		start = end;
	}
	return out;
}

/** The drafts' name for a table row: a draft grant by its key, a saved entitlement by its id. */
export function rowRefOf(item: SearchItem | Record<string, unknown>): RowRef {
	const id = String(item.id ?? '');
	if (isDraftRow(item) || id.startsWith(DRAFT_ID_PREFIX)) {
		return { key: id.slice(DRAFT_ID_PREFIX.length), state: 'draft' };
	}
	return { key: id, state: 'existing' };
}

/**
 * The insert row's values as a draft grant. The picker columns are editor-owned, so the table does
 * not validate them: a missing resource, or an action left unpicked (`null` is "all actions"), is
 * refused here.
 */
export function toDraftGrant(
	values: Record<string, unknown>, nameOf: (id: string) => PermissionName,
): GrantValues {
	const resourceId = values[RESOURCE_FIELD];
	if (typeof resourceId !== 'string' || resourceId === '') {
		return { problem: { field: RESOURCE_FIELD, key: 'action.errors_resource_required' } };
	}
	const actionId = values[ACTION_FIELD];
	if (actionId !== null && (typeof actionId !== 'string' || actionId === '')) {
		return { problem: { field: ACTION_FIELD, key: 'role_permission_selectAction' } };
	}
	const rawDescription = values[DESCRIPTION_FIELD];
	const description = typeof rawDescription === 'string' ? rawDescription : '';
	return {
		grant: {
			resourceId,
			actionId,
			resourceName: nameOf(resourceId),
			actionName: actionId == null ? null : nameOf(actionId),
			description,
		},
	};
}
