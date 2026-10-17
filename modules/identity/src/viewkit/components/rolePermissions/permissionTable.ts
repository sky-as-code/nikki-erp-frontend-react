import { grantKey } from './permissionDrafts';

import type { DraftGrant, PermissionDrafts, PermissionRow } from './permissionDrafts';
import type { PermissionName } from '../../../features/role/rolePermissions';
import type { SearchItem } from '@nikkierp/ui/components/ExcelDataTable';


export const RESOURCE_FIELD = 'resource_id';
export const ACTION_FIELD = 'action_id';
export const DESCRIPTION_FIELD = 'description';
export const PERMISSION_FIELDS = [RESOURCE_FIELD, ACTION_FIELD, DESCRIPTION_FIELD];

/** Marks a row the table shows for a draft grant; no server row carries it. */
export const DRAFT_ROW_FLAG = '$draft';

const DRAFT_ID_PREFIX = 'draft:';

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
		[DRAFT_ROW_FLAG]: true,
		[RESOURCE_FIELD]: grant.resourceId,
		[ACTION_FIELD]: grant.actionId,
		[DESCRIPTION_FIELD]: grant.description.trim(),
		resource: { id: grant.resourceId, [EDGE_LABEL_FIELD]: grant.resourceName },
		action: grant.actionId == null ? null : { id: grant.actionId, [EDGE_LABEL_FIELD]: grant.actionName },
	};
}

/** The saved rows not marked for removal, then the drafts in the order they were added. */
export function mergeDraftRows(items: SearchItem[], drafts: PermissionDrafts): SearchItem[] {
	const kept = drafts.removed.length > 0 ? items.filter(item => !drafts.removed.includes(item.id)) : items;
	return drafts.added.length > 0 ? [...kept, ...drafts.added.map(toDraftRow)] : kept;
}

/** What a delete on the row means to the drafts: drop the draft, or mark the saved entitlement removed. */
export function revocationOf(item: SearchItem): Pick<PermissionRow, 'key' | 'state'> {
	if (isDraftRow(item)) {
		return { key: grantKey(item[RESOURCE_FIELD], item[ACTION_FIELD]), state: 'draft' };
	}
	return { key: String(item.id), state: 'existing' };
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
