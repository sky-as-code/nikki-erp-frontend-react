/**
 * Candidate expansion, ported from `nikkierp/modules/core/requestguard/candidates.go`.
 *
 * This is the single definition of the evaluation semantics on the backend, and this file is its
 * mirror. Keep them identical: what the UI shows and what the API allows must not disagree.
 */

import { buildExpression, omnipotentExpression, ResourceScope, WILDCARD } from './expression';

/**
 * What is known about the *caller*, as opposed to `Perm`, which describes the record being reached
 * for. Both are needed: a bare `org` grant only answers when the caller belongs to the record's
 * org.
 *
 * Sourced from `/me/context` — see `GetUserContextResponse` in the IAM REST DTO.
 */
export type EvalContext = {
	/** Orgs the caller belongs to. */
	userOrgIds: string[],
	/** The org unit the caller belongs to, if any. */
	orgUnitId?: string | null,
	/** The org that orgUnitId belongs to. Needed for the orgunit -> org fallback. */
	orgUnitOrgId?: string | null,
};

/** The permission being asked about: an action on a resource, at a scope. */
export type Perm = {
	actionCode: string,
	resourceCode: string,
	scope: string,
	/** The org the record belongs to. Required to answer an org-scoped question. */
	orgId?: string | null,
	/** The org unit the record belongs to. Required to answer a unit-scoped question. */
	orgUnitId?: string | null,
	/**
	 * Whether the record is the caller's own. Callers whose scope is private must set it; leaving
	 * it false means "not the caller's record", which denies.
	 */
	isRecordOwnedByCaller?: boolean,
};

function belongsToOrg(evalCtx: EvalContext, orgId?: string | null): boolean {
	return orgId != null && evalCtx.userOrgIds.includes(orgId);
}

function belongsToOrgUnit(evalCtx: EvalContext, orgUnitId?: string | null): boolean {
	return orgUnitId != null && evalCtx.orgUnitId != null && evalCtx.orgUnitId === orgUnitId;
}

/**
 * The four wildcard combinations at one scope, widest last so a reader sees exact-first ordering.
 */
function scopeVariants(required: Perm, scope: string, scopeId?: string | null): string[] {
	return [
		buildExpression(required.actionCode, required.resourceCode, scope, scopeId),
		buildExpression(WILDCARD, required.resourceCode, scope, scopeId),
		buildExpression(required.actionCode, WILDCARD, scope, scopeId),
		buildExpression(WILDCARD, WILDCARD, scope, scopeId),
	];
}

/**
 * The org-scoped grants that answer for orgId: the ones naming it explicitly, plus the bare org
 * grants when the caller is a member.
 */
function orgCandidates(required: Perm, evalCtx: EvalContext, orgId?: string | null): string[] {
	if (orgId == null) {
		return [];
	}
	const result = scopeVariants(required, ResourceScope.Org, orgId);
	if (belongsToOrg(evalCtx, orgId)) {
		result.push(...scopeVariants(required, ResourceScope.Org, null));
	}
	return result;
}

function dedupe(items: string[]): string[] {
	const seen = new Set<string>();
	const result: string[] = [];
	for (const item of items) {
		if (!seen.has(item)) {
			seen.add(item);
			result.push(item);
		}
	}
	return result;
}

/**
 * Every stored expression that would satisfy the required permission for this caller. Holding ANY
 * of them means "allowed".
 *
 * Scope widening runs tenant > org > orgunit: a wider grant satisfies a narrower requirement.
 * There is deliberately NO inheritance between org units — a grant on a parent unit does not reach
 * its children, which is what makes a unit grant auditable.
 */
export function candidateExpressions(required: Perm, evalCtx: EvalContext): string[] {
	const candidates: string[] = [];

	// Rank 0: the omnipotent grant answers every question.
	candidates.push(omnipotentExpression());

	// Rank 1: tenant grants answer every scope.
	candidates.push(...scopeVariants(required, ResourceScope.Tenant, null));

	switch (required.scope) {
		case ResourceScope.Tenant:
			// Already covered by the tenant variants above.
			break;

		case ResourceScope.Org:
			candidates.push(...orgCandidates(required, evalCtx, required.orgId));
			break;

		case ResourceScope.OrgUnit:
			// Exact unit grants, and bare unit grants when the caller belongs to that unit.
			candidates.push(...scopeVariants(required, ResourceScope.OrgUnit, required.orgUnitId));
			if (belongsToOrgUnit(evalCtx, required.orgUnitId)) {
				candidates.push(...scopeVariants(required, ResourceScope.OrgUnit, null));
			}
			// Fallback: an org-level grant for the org that owns the unit.
			candidates.push(...orgCandidates(required, evalCtx, required.orgId));
			break;

		case ResourceScope.Private:
			// Reaching here means the record is the caller's own (see hasEntitlement), so a bare
			// private grant answers.
			candidates.push(...scopeVariants(required, ResourceScope.Private, null));
			break;
	}

	return dedupe(candidates);
}
