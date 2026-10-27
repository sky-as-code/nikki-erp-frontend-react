import { useHasEntitlement } from '@nikkierp/ui/components';
import React from 'react';

import { actionRequirement } from './actionEntitlements';

import type { ActionLock } from './useActionLock';
import type { EntitlementRequirement } from '@nikkierp/common/entitlements';


const UNLOCKED: ActionLock = { locked: false, missing: [] };

/**
 * Field-level locks. A grant is additive: `update:iam_user:tenant` covers every field of the
 * resource, `update:iam_user.display_name:tenant` covers that one field. These hooks ask the same
 * question the backend's `requestguard.AssertFieldsPermission` asks. Like `useActionLock`, nothing
 * is locked while the caller's context is loading or the schema name is unknown.
 */
export function useFieldLock(
	schemaName: string | null, field: string | null, actionCode: string, scope?: string,
): ActionLock {
	const fields = React.useMemo(() => (field ? [field] : []), [field]);
	const locks = useFieldLocks(schemaName, fields, actionCode, scope);
	return (field && locks[field]) || UNLOCKED;
}

/** {@link useFieldLock} for many fields at once, keyed by field name. */
export function useFieldLocks(
	schemaName: string | null, fields: readonly string[], actionCode: string, scope?: string,
): Record<string, ActionLock> {
	const requirements = React.useMemo(
		() => (schemaName ? fields.map(field => fieldRequirement(schemaName, field, actionCode, scope)) : []),
		[schemaName, fields, actionCode, scope],
	);
	const decision = useHasEntitlement(requirements);

	return React.useMemo(() => {
		const locks: Record<string, ActionLock> = {};
		if (requirements.length === 0 || decision.isPending) {
			return locks;
		}
		fields.forEach((field, index) => {
			const result = decision.results[index];
			locks[field] = result?.allowed ? UNLOCKED : { locked: true, missing: [result?.expression ?? ''] };
		});
		return locks;
	}, [requirements, decision, fields]);
}

/**
 * The gate of a field-aware action (the built-in create, read, update): open when the caller holds
 * the action on the whole resource or on any one of `fields`. A refusal names the resource-level
 * grant, the one that would open every field.
 */
export function useAnyFieldActionLock(
	schemaName: string | null, actionCode: string | null, fields: readonly string[], scope?: string,
): ActionLock {
	const requirements = React.useMemo(() => {
		if (!schemaName || !actionCode) {
			return [];
		}
		return [
			actionRequirement(schemaName, actionCode, scope),
			...fields.map(field => fieldRequirement(schemaName, field, actionCode, scope)),
		];
	}, [schemaName, actionCode, fields, scope]);
	const decision = useHasEntitlement(requirements);

	return React.useMemo(() => {
		if (requirements.length === 0 || decision.isPending || decision.results.some(result => result.allowed)) {
			return UNLOCKED;
		}
		return { locked: true, missing: [decision.results[0].expression] };
	}, [requirements, decision]);
}

function fieldRequirement(
	schemaName: string, field: string, actionCode: string, scope?: string,
): EntitlementRequirement {
	return { ...actionRequirement(schemaName, actionCode, scope), field };
}
