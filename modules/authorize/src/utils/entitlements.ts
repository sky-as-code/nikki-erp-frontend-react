import type { Entitlement } from '@/features/entitlements';


const GLOBAL_SCOPE = '__GLOBAL__';

export function createEntitlementKey(
	entitlement: Pick<Entitlement, 'id' | 'scopeRef'>,
): string {
	return `${entitlement.id}:${entitlement.scopeRef ?? GLOBAL_SCOPE}`;
}
