import React from 'react';

import { useHasEntitlement } from '../../PermissionGuard/entitlementContext';

import type { EntitlementRequirementInput } from '../../PermissionGuard/entitlementContext';
import type { CapabilityLock } from '../capabilities';
import type { ActionColumn } from '../types';


/** Keyed by {@link actionLockKey}; an action without an entitlement has no entry. */
export type ActionColumnLocks = Record<string, CapabilityLock>;

export function actionLockKey(columnKey: string, actionKey: string): string {
	return `${columnKey}/${actionKey}`;
}

type AskedAction = { key: string, requirement: EntitlementRequirementInput };

/**
 * One entitlement check for every action of every column, like `useCapabilityLocks`: unlocked while
 * the entitlement context loads, so a cold load does not flash a refusal on every row.
 */
export function useActionColumnLocks(actionColumns: ActionColumn[] | undefined): ActionColumnLocks {
	// Keyed by value: a page passing fresh column objects each render must not re-check.
	const key = JSON.stringify((actionColumns ?? []).flatMap(column => column.actions
		.filter(action => action.entitlement != null)
		.map(action => ({ key: actionLockKey(column.key, action.key), requirement: action.entitlement }))));
	const asked = React.useMemo(() => JSON.parse(key) as AskedAction[], [key]);
	const requirements = React.useMemo(() => asked.map(entry => entry.requirement), [asked]);
	const decision = useHasEntitlement(requirements);
	return React.useMemo(() => {
		const locks: ActionColumnLocks = {};
		if (decision.isPending) {
			return locks;
		}
		asked.forEach((entry, index) => {
			const result = decision.results[index];
			if (result && !result.allowed) {
				locks[entry.key] = { locked: true, missing: [result.expression] };
			}
		});
		return locks;
	}, [asked, decision]);
}
