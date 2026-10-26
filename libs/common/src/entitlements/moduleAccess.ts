/**
 * Whether the caller holds anything in a module, which decides if the module may be opened at all.
 * A module owns the resources whose code starts with one of its model prefixes plus `_` (`iam_user`
 * belongs to `iam`; `inventory_brand` and `sales_order` both belong to `commerce`); a wildcard
 * resource covers every module.
 *
 * Only the resource segment is read. The action and scope are what each page inside the module
 * checks for itself, so `read:iam_user:*` opens IAM even though a wildcard scope is not a grant the
 * guard would honour for any one request.
 */

import { WILDCARD } from './expression';

import type { EntitlementContext } from './guard';


export function canAccessModule(
	modelPrefixes: string | readonly string[], context: EntitlementContext,
): boolean {
	if (context.isOwner) {
		return true;
	}
	const ownPrefixes = (typeof modelPrefixes === 'string' ? [modelPrefixes] : modelPrefixes)
		.map(prefix => `${prefix}_`);
	return context.entitlements.some((expr) => {
		const resource = resourceSegment(expr);
		if (resource === WILDCARD) {
			return true;
		}
		return resource != null && ownPrefixes.some(prefix => resource.startsWith(prefix));
	});
}

function resourceSegment(expr: string): string | null {
	const segments = expr.split(':');
	return segments.length === 3 && segments[1] !== '' ? segments[1] : null;
}
