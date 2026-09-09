/**
 * Supplies the caller's authorization state to the entitlement evaluator.
 *
 * The evaluation itself lives in `@nikkierp/common/entitlements` (a port of the backend guard) and
 * the React plumbing in `@nikkierp/ui`, which cannot import this package — the dependency runs the
 * other way, and a micro-app must not reach into Shell state. This file is the bridge: it reads
 * the user context and hands it to `EntitlementProvider`.
 *
 * What this decides is what the UI SHOWS. The backend re-checks every request and remains the only
 * authority.
 */

import { ResourceScope } from '@nikkierp/common/entitlements';
import { useMemo } from 'react';
import { useParams } from 'react-router';

import { useFindMyOrg, useGetUserContext } from './userContextSelectors';

import type { EntitlementContext, EntitlementRequirement } from '@nikkierp/common/entitlements';
import type { EntitlementSource } from '@nikkierp/ui/components';


/** The caller's authorization state, or null while the context is still loading. */
export function useEntitlementContext(): EntitlementContext | null {
	const userContext = useGetUserContext().data;

	return useMemo(() => {
		if (!userContext) {
			return null;
		}
		return {
			entitlements: userContext.entitlements ?? [],
			isOwner: userContext.isOwner,
			userOrgIds: userContext.userOrgIds ?? [],
			orgUnitId: userContext.orgUnitId,
			orgUnitOrgId: userContext.orgUnitOrgId,
		};
	}, [userContext]);
}

/**
 * The context plus a scope resolver, ready to pass to `EntitlementProvider`.
 *
 * An org-scoped requirement usually omits the org, because the call site does not know it: the org
 * comes from the route the user is on. One that names an org explicitly keeps it.
 */
export function useEntitlementSource(): EntitlementSource {
	const context = useEntitlementContext();
	const { orgSlug } = useParams();
	const activeOrg = useFindMyOrg(orgSlug ?? '');
	const activeOrgId = activeOrg?.id ?? null;
	const orgUnitId = context?.orgUnitId ?? null;

	return useMemo(() => ({
		context,
		resolveScope: (requirement: EntitlementRequirement) => ({
			...requirement,
			orgId: requirement.orgId
				?? (requirement.scope === ResourceScope.Org ? activeOrgId : undefined),
			orgUnitId: requirement.orgUnitId
				?? (requirement.scope === ResourceScope.OrgUnit ? orgUnitId : undefined),
		}),
	}), [context, activeOrgId, orgUnitId]);
}
