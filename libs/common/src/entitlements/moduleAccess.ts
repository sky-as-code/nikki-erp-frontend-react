/**
 * Whether the caller holds anything in a module, which decides if the module may be opened at all.
 * A module owns the resources whose code starts with its model prefix plus `_` (`iam_user` belongs
 * to `iam`); a wildcard resource covers every module.
 *
 * Only the resource segment is read. The action and scope are what each page inside the module
 * checks for itself, so `read:iam_user:*` opens IAM even though a wildcard scope is not a grant the
 * guard would honour for any one request.
 */

import { WILDCARD } from './expression';

import type { EntitlementContext } from './guard';


export function canAccessModule(modelPrefix: string, context: EntitlementContext): boolean {
	if (context.isOwner) {
		return true;
	}
	const ownPrefix = `${modelPrefix}_`;
	return context.entitlements.some((expr) => {
		const resource = resourceSegment(expr);
		return resource === WILDCARD || (resource?.startsWith(ownPrefix) ?? false);
	});
}

function resourceSegment(expr: string): string | null {
	const segments = expr.split(':');
	return segments.length === 3 && segments[1] !== '' ? segments[1] : null;
}
