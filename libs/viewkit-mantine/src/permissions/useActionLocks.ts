import { useHasEntitlement } from '@nikkierp/ui/components';
import React from 'react';

import { actionRequirement } from './actionEntitlements';

import type { DataTableAction } from '@nikkierp/ui/components/DataTable';


/**
 * Marks each action locked when the caller lacks the entitlement it needs.
 *
 * Locked rather than hidden: the toolbar keeps the same shape for everyone, and clicking explains
 * the refusal instead of leaving the user to guess why an action they expected is missing.
 *
 * While the user context is still loading nothing is locked — a context that has not arrived is
 * indistinguishable from an empty one, and locking on it would flash every button greyed on each
 * cold load.
 */
export function useActionLocks(
	actions: DataTableAction[],
	schemaName: string,
	actionCodeOf: (action: DataTableAction) => string | null,
): DataTableAction[] {
	// An action with no derivable code is left ungated: locking a button the user may in fact
	// click is worse than not locking one they cannot.
	const codes = React.useMemo(() => actions.map(actionCodeOf), [actions, actionCodeOf]);

	const requirements = React.useMemo(
		() => codes.map(code => (code == null ? null : actionRequirement(schemaName, code))),
		[codes, schemaName],
	);

	// Nulls are dropped for the query but the index mapping is kept, so each result can be put
	// back against the action that asked for it.
	const asked = React.useMemo(
		() => requirements
			.map((requirement, index) => ({ requirement, index }))
			.filter((entry): entry is { requirement: NonNullable<typeof entry.requirement>, index: number } =>
				entry.requirement != null),
		[requirements],
	);

	const decision = useHasEntitlement(React.useMemo(() => asked.map(a => a.requirement), [asked]));

	return React.useMemo(() => {
		if (decision.isPending || decision.allowed) {
			return actions;
		}

		const locked = new Map<number, string>();
		decision.results.forEach((result, position) => {
			if (!result.allowed) {
				locked.set(asked[position].index, result.expression);
			}
		});

		if (locked.size === 0) {
			return actions;
		}

		return actions.map((action, index) => {
			const expression = locked.get(index);
			return expression ? { ...action, locked: true, lockedMissing: [expression] } : action;
		});
	}, [actions, asked, decision]);
}
