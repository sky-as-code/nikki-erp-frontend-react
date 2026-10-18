import * as dyn from '@nikkierp/common/dynamicModel';
import { useCommand } from '@nikkierp/ui/hookhoc';
import { useResourceUpdateContext } from '@nikkierp/viewkit-mantine';
import React from 'react';

import {
	buildEntitlementsContribution, draftsFor, emptyDrafts, grantDraft, revokeRow, updateDescription,
} from './permissionDrafts';
import { RoleCommands } from '../../../features/role/commands';

import type { DraftGrant, GrantOutcome, PermissionDrafts, RowRef } from './permissionDrafts';
import type { GrantableAction, GrantableResource, RoleEntitlement } from '../../../features/role/rolePermissions';
import type { ClientErrorItem } from '@nikkierp/common/types';


export type LoadFailure = { clientErrors: ClientErrorItem[], error: unknown };

export type LoadedList<TItem> = {
	items: TItem[],
	isPending: boolean,
	failure: LoadFailure | null,
};

const NO_ITEMS: never[] = [];

function toLoadedList<TItem>(command: {
	data: dyn.RestSearchResponse<any> | null, isPending: boolean, clientErrors: ClientErrorItem[], error: unknown,
}): LoadedList<TItem> {
	const hasFailed = command.error != null || command.clientErrors.length > 0;
	return {
		items: (command.data?.items as TItem[] | undefined) ?? NO_ITEMS,
		isPending: command.isPending,
		failure: hasFailed ? { clientErrors: command.clientErrors, error: command.error } : null,
	};
}

/** Every resource, read when the insert row opens: read mode has no picker. */
export function useGrantableResources(): LoadedList<GrantableResource> {
	const command = useCommand<dyn.RestSearchResponse<GrantableResource>>(RoleCommands.SEARCH_GRANTABLE_RESOURCES);
	const publish = command.publish;

	React.useEffect(() => {
		void publish();
	}, [publish]);

	return toLoadedList<GrantableResource>(command);
}

/** The picked resource's actions; none until a resource is picked. */
export function useResourceActions(resourceId: string | null): LoadedList<GrantableAction> {
	const command = useCommand<dyn.RestSearchResponse<GrantableAction>>(RoleCommands.SEARCH_RESOURCE_ACTIONS);
	const publish = command.publish;

	React.useEffect(() => {
		if (resourceId) {
			void publish({ resource_id: resourceId });
		}
	}, [publish, resourceId]);

	const loaded = toLoadedList<GrantableAction>(command);
	return resourceId ? loaded : { items: NO_ITEMS, isPending: false, failure: null };
}

export type PermissionDraftState = {
	drafts: PermissionDrafts,
	grant: (grant: DraftGrant) => GrantOutcome,
	revoke: (row: RowRef) => void,
	update: (row: RowRef, description: string) => void,
};

/**
 * The section's unsaved grants, revokes and description edits. They live only for one edit session of one record:
 * leaving update mode (Cancel, or a successful Save) discards them, and they are keyed by role id
 * so a split view switching records in place never shows, or sends, another role's drafts.
 */
export function usePermissionDraftState(args: {
	roleId: string,
	/** The saved rows as last loaded, read when a grant is drafted. */
	getExisting: () => RoleEntitlement[],
	updateMode: boolean,
	onSaved: () => void,
}): PermissionDraftState {
	const { roleId, getExisting, updateMode, onSaved } = args;
	const [state, setState] = React.useState(() => emptyDrafts(roleId));
	const drafts = draftsFor(state, roleId);

	React.useEffect(() => {
		if (!updateMode) {
			setState(emptyDrafts(roleId));
		}
	}, [updateMode, roleId]);

	useDraftContributor(drafts, () => {
		setState(emptyDrafts(roleId));
		onSaved();
	});

	return {
		drafts,
		grant: (draft: DraftGrant): GrantOutcome => {
			const result = grantDraft(drafts, draft, getExisting());
			setState(result.drafts);
			return result.outcome;
		},
		revoke: row => setState(revokeRow(drafts, row)),
		update: (row, description) => {
			const saved = getExisting().find(item => item.id === row.key)?.description ?? '';
			setState(updateDescription(drafts, row, description, saved));
		},
	};
}

/** Folds the drafts into the page's own update request, so fields and grants save in one write. */
function useDraftContributor(drafts: PermissionDrafts, onSaved: () => void): void {
	const register = useResourceUpdateContext().registerUpdatePayload;
	const latest = React.useRef({ drafts, onSaved });

	React.useEffect(() => {
		latest.current = { drafts, onSaved };
	});

	React.useEffect(() => register?.({
		build: () => buildEntitlementsContribution(latest.current.drafts),
		onSaved: () => latest.current.onSaved(),
	}), [register]);
}
