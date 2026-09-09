import {
	checkEntitlements, requirementFromExpression, requirementToExpression,
	type EntitlementContext, type EntitlementRequirement,
} from '@nikkierp/common/entitlements';
import React from 'react';


/** A requirement may be declared structurally, or as the literal a backend refusal would name. */
export type EntitlementRequirementInput = EntitlementRequirement | string;

/** The verdict on one requirement, in the order it was asked. */
export type EntitlementResult = {
	allowed: boolean,
	/** The expression a refusal names — including the org id the resolver filled in. */
	expression: string,
};

export type EntitlementDecision = {
	allowed: boolean,
	/** The expressions the caller lacks, ready to show in a refusal. */
	missing: string[],
	/**
	 * One entry per requirement, positionally aligned with the input. Lets a caller gating several
	 * controls at once tell which of them was refused, without re-deriving the literal — the
	 * resolver fills in a scope id the call site does not know.
	 */
	results: EntitlementResult[],
	/**
	 * True until the caller's context has loaded. A refusal must never be rendered while this
	 * holds: a context that has not arrived is indistinguishable from an empty one, so treating it
	 * as a denial flashes "insufficient permission" on every cold load.
	 */
	isPending: boolean,
};

export type EntitlementSource = {
	/** The caller's authorization state, or null while it is still loading. */
	context: EntitlementContext | null,
	/** Fills in the scope id a requirement did not name, from the active route. */
	resolveScope?: (requirement: EntitlementRequirement) => EntitlementRequirement,
};

const EntitlementSourceContext = React.createContext<EntitlementSource | null>(null);

/**
 * Supplies the caller's authorization state to everything below it.
 *
 * The state itself lives in `@nikkierp/shell`, which this package cannot import — the dependency
 * runs the other way, and a micro-app must not reach into Shell state either. The Shell mounts
 * this provider and passes the context down, so both can consume one evaluator.
 */
export function EntitlementProvider(
	props: { value: EntitlementSource, children: React.ReactNode },
): React.ReactElement {
	return (
		<EntitlementSourceContext.Provider value={props.value}>
			{props.children}
		</EntitlementSourceContext.Provider>
	);
}

/**
 * Whether the caller holds every given requirement, and which they lack.
 *
 * Fails closed: with no provider mounted, or before the context loads, nothing is granted. A
 * malformed literal is reported as missing rather than ignored, so a typo in a requirement is
 * visible in the refusal instead of silently allowing.
 */
export function useHasEntitlement(requirements: EntitlementRequirementInput[]): EntitlementDecision {
	const source = React.useContext(EntitlementSourceContext);

	return React.useMemo(() => {
		if (source?.context == null) {
			return { allowed: false, missing: [], results: [], isPending: true };
		}

		const context = source.context;
		const results: EntitlementResult[] = requirements.map(input => {
			const parsed = typeof input === 'string' ? requirementFromExpression(input) : input;
			// A malformed literal fails closed and is reported verbatim, so a typo shows up in the
			// refusal instead of silently allowing.
			if (parsed == null) {
				return { allowed: false, expression: String(input) };
			}
			const requirement = source.resolveScope ? source.resolveScope(parsed) : parsed;
			const decision = checkEntitlements([requirement], context);
			return {
				allowed: decision.allowed,
				expression: decision.missing[0] ?? requirementToExpression(requirement),
			};
		});

		const missing = results.filter(result => !result.allowed).map(result => result.expression);
		return { allowed: missing.length === 0, missing, results, isPending: false };
	}, [source, requirements]);
}
