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

/** The unsaved changes of one role's Entitlements section. `roleId` keeps them from leaking to another record. */
export type PermissionDrafts = {
	roleId: string,
	added: DraftGrant[],
	/** Entitlement ids marked for removal. */
	removed: string[],
	/** New descriptions of saved entitlements, by entitlement id. */
	updated: Record<string, string>,
};

export type GrantOutcome = 'added' | 'restored' | 'duplicate';

/** A table row as the drafts know it: an entitlement id, or {@link grantKey} for a draft. */
export type RowRef = {
	key: string,
	state: 'existing' | 'draft',
};

export type SelectOption = { value: string, label: string };

export type NameResolver = (name: PermissionName) => string;

export type EntitlementsContribution = {
	entitlements: {
		add: { resource_id: string, action_id: string | null, description?: string }[],
		remove: string[],
		update: { id: string, description: string }[],
	},
};

export function emptyDrafts(roleId: string): PermissionDrafts {
	return { roleId, added: [], removed: [], updated: {} };
}

/** The drafts of `roleId`, or none when the state still belongs to the previously shown record. */
export function draftsFor(state: PermissionDrafts, roleId: string): PermissionDrafts {
	return state.roleId === roleId ? state : emptyDrafts(roleId);
}

export function hasDrafts(drafts: PermissionDrafts): boolean {
	return drafts.added.length > 0 || drafts.removed.length > 0 || Object.keys(drafts.updated).length > 0;
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

/**
 * Revoke on a draft row drops it; on a saved row it toggles the removal mark, so it is undoable. A
 * removed entitlement keeps no description edit: the backend refuses to update what it removes.
 */
export function revokeRow(drafts: PermissionDrafts, row: RowRef): PermissionDrafts {
	if (row.state === 'draft') {
		return { ...drafts, added: drafts.added.filter(item => grantKey(item.resourceId, item.actionId) !== row.key) };
	}
	if (drafts.removed.includes(row.key)) {
		return { ...drafts, removed: drafts.removed.filter(id => id !== row.key) };
	}
	const { [row.key]: _dropped, ...updated } = drafts.updated;
	return { ...drafts, removed: [...drafts.removed, row.key], updated };
}

/**
 * A description edited in the row editor. On a draft it rewrites the draft; on a saved entitlement
 * it is remembered for the save, and forgotten again once it matches the saved text.
 */
export function updateDescription(
	drafts: PermissionDrafts, row: RowRef, description: string, savedDescription: string,
): PermissionDrafts {
	if (row.state === 'draft') {
		const added = drafts.added.map(item => (
			grantKey(item.resourceId, item.actionId) === row.key ? { ...item, description } : item
		));
		return { ...drafts, added };
	}
	const { [row.key]: _previous, ...rest } = drafts.updated;
	const updated = description === savedDescription ? rest : { ...rest, [row.key]: description };
	return { ...drafts, updated };
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
	const update = Object.entries(drafts.updated).map(([id, description]) => ({ id, description: description.trim() }));
	return { entitlements: { add, remove: [...drafts.removed], update } };
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
