import { useHasEntitlement } from '@nikkierp/ui/components';
import React from 'react';

import { actionRequirement } from './actionEntitlements';


export type ActionLock = {
	locked: boolean,
	missing: string[],
};

const UNLOCKED: ActionLock = { locked: false, missing: [] };

/**
 * Whether one action should render locked, for a single hand-written button.
 *
 * Nothing is locked while the caller's context is loading, nor when the schema name is not yet
 * known — refusing on absent information would grey the control on every cold load. Use
 * {@link useActionLocks} for a list of actions instead.
 */
export function useActionLock(schemaName: string | null, actionCode: string | null): ActionLock {
	const requirements = React.useMemo(
		() => (schemaName && actionCode ? [actionRequirement(schemaName, actionCode)] : []),
		[schemaName, actionCode],
	);

	const decision = useHasEntitlement(requirements);

	return React.useMemo(() => {
		if (requirements.length === 0 || decision.isPending || decision.allowed) {
			return UNLOCKED;
		}
		return { locked: true, missing: decision.missing };
	}, [requirements, decision]);
}
