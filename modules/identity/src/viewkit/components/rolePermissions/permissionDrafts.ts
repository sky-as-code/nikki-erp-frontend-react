import type {
	GrantableAction, GrantableResource, PermissionName, RoleEntitlement,
} from '../../../features/role/rolePermissions';
import type { ModelSchemaLangJson } from '@nikkierp/common/dynamicModel';
import type { ClientErrorItem } from '@nikkierp/common/types';


/** The `Select` value standing for a `null` `action_id`, i.e. the `*` (all actions) grant. */
export const ALL_ACTIONS_VALUE = '*';

const ENTITLEMENTS_FIELD = 'entitlements';
const MISSING_TRANSLATION = '$missing.translation';

/** A grant added in this edit session, not yet saved. */
export type DraftGrant = {
	resourceId: string,
	actionId: string | null,
	resourceName: PermissionName,
	actionName: PermissionName,
	description: string,
};

/** The unsaved changes of one role's Permission section. `roleId` keeps them from leaking to another record. */
export type PermissionDrafts = {
	roleId: string,
	added: DraftGrant[],
	/** Entitlement ids marked for removal. */
	removed: string[],
};

export type GrantOutcome = 'added' | 'restored' | 'duplicate';

export type PermissionRow = {
	/** The entitlement id, or {@link grantKey} for a draft: stable across sorting, so usable in test ids. */
	key: string,
	state: 'existing' | 'draft' | 'removed',
	resourceLabel: string,
	actionLabel: string,
	isAllActions: boolean,
	description: string,
};

export type SelectOption = { value: string, label: string };

export type NameResolver = (name: PermissionName) => string;

export type RowLabels = { nameOf: NameResolver, allLabel: string };

export type EntitlementsContribution = {
	entitlements: {
		add: { resource_id: string, action_id: string | null, description?: string }[],
		remove: string[],
	},
};

export function emptyDrafts(roleId: string): PermissionDrafts {
	return { roleId, added: [], removed: [] };
}

/** The drafts of `roleId`, or none when the state still belongs to the previously shown record. */
export function draftsFor(state: PermissionDrafts, roleId: string): PermissionDrafts {
	return state.roleId === roleId ? state : emptyDrafts(roleId);
}

export function hasDrafts(drafts: PermissionDrafts): boolean {
	return drafts.added.length > 0 || drafts.removed.length > 0;
}

/** One grant per resource + action, which is what the backend's unique expression enforces. */
export function grantKey(resourceId: string | null | undefined, actionId: string | null | undefined): string {
	return `${resourceId ?? ''}:${actionId ?? ALL_ACTIONS_VALUE}`;
}

/**
 * Adds a draft grant. Granting back an existing entitlement that is marked for removal undoes the
 * removal instead, since sending both would ask the backend to drop and re-create the same row.
 */
export function grantDraft(
	drafts: PermissionDrafts, grant: DraftGrant, existing: RoleEntitlement[],
): { drafts: PermissionDrafts, outcome: GrantOutcome } {
	const key = grantKey(grant.resourceId, grant.actionId);
	const held = existing.find(item => grantKey(item.resource_id, item.action_id) === key);
	if (held && drafts.removed.includes(held.id)) {
		return { drafts: { ...drafts, removed: drafts.removed.filter(id => id !== held.id) }, outcome: 'restored' };
	}
	const isDrafted = drafts.added.some(item => grantKey(item.resourceId, item.actionId) === key);
	if (held || isDrafted) {
		return { drafts, outcome: 'duplicate' };
	}
	return { drafts: { ...drafts, added: [...drafts.added, grant] }, outcome: 'added' };
}

/** Revoke on a draft row drops it; on a saved row it toggles the removal mark, so it is undoable. */
export function revokeRow(drafts: PermissionDrafts, row: Pick<PermissionRow, 'key' | 'state'>): PermissionDrafts {
	if (row.state === 'draft') {
		return { ...drafts, added: drafts.added.filter(item => grantKey(item.resourceId, item.actionId) !== row.key) };
	}
	const removed = drafts.removed.includes(row.key)
		? drafts.removed.filter(id => id !== row.key)
		: [...drafts.removed, row.key];
	return { ...drafts, removed };
}

/** The `entitlements` key of the role's update request, or `undefined` when nothing changed. */
export function buildEntitlementsContribution(drafts: PermissionDrafts): EntitlementsContribution | undefined {
	if (!hasDrafts(drafts)) {
		return undefined;
	}
	const add = drafts.added.map(item => {
		const description = item.description.trim();
		return {
			resource_id: item.resourceId,
			action_id: item.actionId,
			...(description ? { description } : {}),
		};
	});
	return { entitlements: { add, remove: [...drafts.removed] } };
}

/** Saved and drafted rows together, sorted by resource label, then `All` first, then action label. */
export function toPermissionRows(
	existing: RoleEntitlement[], drafts: PermissionDrafts, labels: RowLabels,
): PermissionRow[] {
	const saved = existing.map((item): PermissionRow => ({
		key: item.id,
		state: drafts.removed.includes(item.id) ? 'removed' : 'existing',
		resourceLabel: labelOrFallback(labels.nameOf(item.resource?.name), item.resource?.code, item.resource_id),
		actionLabel: item.action_id == null
			? labels.allLabel
			: labelOrFallback(labels.nameOf(item.action?.name), item.action?.code, item.action_id),
		isAllActions: item.action_id == null,
		description: item.description ?? '',
	}));
	const added = drafts.added.map((item): PermissionRow => ({
		key: grantKey(item.resourceId, item.actionId),
		state: 'draft',
		resourceLabel: labelOrFallback(labels.nameOf(item.resourceName), null, item.resourceId),
		actionLabel: item.actionId == null
			? labels.allLabel
			: labelOrFallback(labels.nameOf(item.actionName), null, item.actionId),
		isAllActions: item.actionId == null,
		description: item.description.trim(),
	}));
	return [...saved, ...added].sort(compareRows);
}

function compareRows(left: PermissionRow, right: PermissionRow): number {
	return compareLabels(left.resourceLabel, right.resourceLabel)
		|| Number(right.isAllActions) - Number(left.isAllActions)
		|| compareLabels(left.actionLabel, right.actionLabel);
}

export function toResourceOptions(resources: GrantableResource[], nameOf: NameResolver): SelectOption[] {
	return resources
		.map(item => ({ value: item.id, label: labelOrFallback(nameOf(item.name), item.code, item.id) }))
		.sort((left, right) => compareLabels(left.label, right.label));
}

/** The resource's actions sorted by label, behind the `All` option. */
export function toActionOptions(actions: GrantableAction[], nameOf: NameResolver, allLabel: string): SelectOption[] {
	const sorted = actions
		.map(item => ({ value: item.id, label: labelOrFallback(nameOf(item.name), item.code, item.id) }))
		.sort((left, right) => compareLabels(left.label, right.label));
	return [{ value: ALL_ACTIONS_VALUE, label: allLabel }, ...sorted];
}

/**
 * Resolves a `langjson` name through `localize`. A plain string is already a label (a row written
 * before names became `langjson`), and must not be looked up as a translation key.
 */
export function resolveName(name: PermissionName, localize: (langJson: ModelSchemaLangJson) => string): string {
	if (name == null) {
		return '';
	}
	if (typeof name === 'string') {
		return name;
	}
	const label = localize(name);
	return label === MISSING_TRANSLATION ? Object.values(name)[0] ?? '' : label;
}

/** The save's rejections addressed to the delta: the form cannot show them, since no input owns those fields. */
export function entitlementErrors(clientErrors: ClientErrorItem[]): ClientErrorItem[] {
	return clientErrors.filter(item => item.field === ENTITLEMENTS_FIELD
		|| item.field?.startsWith(`${ENTITLEMENTS_FIELD}.`));
}

function labelOrFallback(label: string, code: string | null | undefined, id: string | null | undefined): string {
	return label || code || id || '';
}

function compareLabels(left: string, right: string): number {
	return left.localeCompare(right, undefined, { sensitivity: 'base' });
}
