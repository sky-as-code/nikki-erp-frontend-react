import React from 'react';

import { resolveActionCode } from './actionEntitlements';
import { useActionLocks } from './useActionLocks';

import type { LockableAction } from './useActionLocks';


type TableAction = { actionCode?: string, actionResource?: string, actionScope?: string, command?: string };

function scopeOf(action: TableAction): string | undefined {
	return action.actionScope;
}

/**
 * Locks for an embedded table's page-authored actions. Each is checked on its own
 * `actionResource` when it names one, otherwise on the listed schema, and at its `actionScope`
 * when it names one, otherwise org.
 */
export function useTableActionLocks<TAction extends TableAction>(
	actions: TAction[], schemaName: string,
): Array<TAction & LockableAction> {
	const resourceOf = React.useCallback(
		(action: TAction) => action.actionResource ?? schemaName, [schemaName],
	);
	return useActionLocks(actions as Array<TAction & LockableAction>, resourceOf, resolveActionCode, scopeOf);
}
