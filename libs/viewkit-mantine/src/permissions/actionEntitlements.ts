import { ResourceScope, type EntitlementRequirement } from '@nikkierp/common/entitlements';


/**
 * The entitlement a page action needs, derived rather than declared.
 *
 * A page already names the resource it edits (`schemaName`, which is the backend resource code
 * verbatim) and the engine already knows which standard action each toolbar button performs. So
 * the requirement is computable, and every list and detail page gets permission-aware buttons
 * without touching its metadata — an opt-in `requiredEntitlements` on every action across every
 * page would be a large JSON change and easy to forget on the next page written.
 *
 * Scope is org: almost every business resource is org-scoped, and the Shell fills in the active
 * org. A resource that is genuinely tenant-scoped still resolves, because a tenant-level grant
 * answers an org-scoped question (see `candidateExpressions`).
 */
export function actionRequirement(schemaName: string, actionCode: string): EntitlementRequirement {
	return { action: actionCode, resource: schemaName, scope: ResourceScope.Org };
}

/**
 * Action codes for the buttons the engine renders itself.
 *
 * These match the seeded `iam_actions.code` values — `create`, `delete`, `update`, `set_archived`
 * are the vocabulary every module's seeds use.
 */
export const StandardActionCode = {
	Create: 'create',
	Read: 'read',
	Update: 'update',
	Delete: 'delete',
	Archive: 'set_archived',
} as const;

/**
 * Maps a command name to the action code it performs, for actions a page declares by command.
 *
 * Commands are named `{module}.{verb}_{entity}` (e.g. `iam.suspend_user`), and the verb is not
 * always the action code — `suspend` is an `update` carrying a status. Returning null means "no
 * requirement derivable", and the caller leaves that action ungated rather than guessing: locking
 * a button the user may in fact click is worse than not locking one they cannot.
 */
export function commandActionCode(command: string | undefined): string | null {
	if (!command) {
		return null;
	}
	const verb = command.split('.').pop()?.split('_')[0];
	switch (verb) {
		case 'create':
			return StandardActionCode.Create;
		case 'delete':
			return StandardActionCode.Delete;
		case 'update':
			return StandardActionCode.Update;
		// Status transitions are an update carrying a fixed status, so they need `update`.
		case 'suspend':
		case 'activate':
		case 'invite':
			return StandardActionCode.Update;
		case 'set':
			return command.includes('archived') ? StandardActionCode.Archive : null;
		default:
			return null;
	}
}
