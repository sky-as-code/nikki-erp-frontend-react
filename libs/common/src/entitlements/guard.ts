/**
 * The evaluation entry point, mirroring `AssertPermission`
 * (`nikkierp/modules/core/requestguard/require_permission.go`).
 *
 * This decides what the UI SHOWS. It is not a security control: the backend re-checks every
 * request and remains the only authority. Hiding a button the server would refuse is a courtesy;
 * showing one it would refuse is merely a bad experience, not a breach. Never remove a server-side
 * check because this exists.
 */

import { candidateExpressions, type EvalContext, type Perm } from './candidates';
import { buildFieldExpression, parseExpression, ResourceScope } from './expression';

/** A permission a feature requires, as declared at a call site. */
export type EntitlementRequirement = {
	action: string,
	resource: string,
	/** One field of the resource; absent for a resource-level requirement. */
	field?: string,
	scope: string,
	orgId?: string | null,
	orgUnitId?: string | null,
	isRecordOwnedByCaller?: boolean,
};

/** The caller's own authorization state, as returned by `/me/context`. */
export type EntitlementContext = EvalContext & {
	/** Every expression the caller holds. */
	entitlements: string[],
	/** The installation owner passes every check. */
	isOwner?: boolean,
};

export type EntitlementDecision = {
	allowed: boolean,
	/** The expressions the caller was missing, ready to show in the refusal message. */
	missing: string[],
};

function toPerm(requirement: EntitlementRequirement): Perm {
	return {
		actionCode: requirement.action,
		resourceCode: requirement.resource,
		fieldName: requirement.field,
		scope: requirement.scope,
		orgId: requirement.orgId,
		orgUnitId: requirement.orgUnitId,
		isRecordOwnedByCaller: requirement.isRecordOwnedByCaller,
	};
}

/** The exact expression a refusal names, which is what makes it actionable for an administrator. */
export function requirementToExpression(requirement: EntitlementRequirement): string {
	const scopeId = requirement.scope === ResourceScope.Org
		? requirement.orgId
		: requirement.scope === ResourceScope.OrgUnit
			? requirement.orgUnitId
			: null;
	return buildFieldExpression(
		requirement.action, requirement.resource, requirement.field ?? '', requirement.scope, scopeId,
	);
}

/** Whether the caller holds one requirement. */
export function hasEntitlement(
	requirement: EntitlementRequirement, context: EntitlementContext,
): boolean {
	if (context.isOwner) {
		return true;
	}

	// The private scope is about the record, not the expression: a private grant answers only for
	// the caller's own record.
	if (requirement.scope === ResourceScope.Private && !requirement.isRecordOwnedByCaller) {
		return false;
	}

	const held = new Set(context.entitlements);
	return candidateExpressions(toPerm(requirement), context)
		.some(candidate => held.has(candidate));
}

/**
 * Whether the caller holds EVERY requirement, and which they lack.
 *
 * All-must-hold mirrors a handler asserting several permissions in sequence: the first refusal
 * ends the request there.
 */
export function checkEntitlements(
	requirements: EntitlementRequirement[], context: EntitlementContext,
): EntitlementDecision {
	const missing = requirements
		.filter(requirement => !hasEntitlement(requirement, context))
		.map(requirementToExpression);

	return { allowed: missing.length === 0, missing };
}

/**
 * Field-level checks, mirroring `field_permission.go`. Grants are additive: a resource grant covers
 * every field, a field grant (`update:iam_user.display_name:tenant`) covers its field alone.
 * `requirement.field` is ignored; the fields are passed separately.
 */
export function checkFieldEntitlements(
	requirement: EntitlementRequirement, fields: readonly string[], context: EntitlementContext,
): EntitlementDecision {
	const resourceLevel = { ...requirement, field: undefined };
	if (hasEntitlement(resourceLevel, context)) {
		return { allowed: true, missing: [] };
	}
	const missing = [...new Set(fields)].sort()
		.map(field => ({ ...resourceLevel, field }))
		.filter(fieldLevel => !hasEntitlement(fieldLevel, context))
		.map(requirementToExpression);
	return { allowed: missing.length === 0, missing };
}

/** The fields the caller holds the requirement on, in input order. */
export function grantedFields(
	requirement: EntitlementRequirement, fields: readonly string[], context: EntitlementContext,
): string[] {
	const resourceLevel = { ...requirement, field: undefined };
	if (hasEntitlement(resourceLevel, context)) {
		return [...fields];
	}
	return fields.filter(field => hasEntitlement({ ...resourceLevel, field }, context));
}

/**
 * The action gate of a field-aware operation (built-in create, read, update): the resource grant,
 * or a grant on at least one field. A refusal names the resource-level expression.
 */
export function checkAnyFieldEntitlement(
	requirement: EntitlementRequirement, fields: readonly string[], context: EntitlementContext,
): EntitlementDecision {
	const resourceLevel = { ...requirement, field: undefined };
	const allowed = hasEntitlement(resourceLevel, context)
		|| fields.some(field => hasEntitlement({ ...resourceLevel, field }, context));
	return { allowed, missing: allowed ? [] : [requirementToExpression(resourceLevel)] };
}

/**
 * Parses a literal like `update:products:org` into a requirement, so a call site may declare one
 * either way. Returns null if the literal is malformed, which callers should treat as "not
 * granted" rather than silently ignoring.
 */
export function requirementFromExpression(expr: string): EntitlementRequirement | null {
	const parsed = parseExpression(expr);
	if (parsed == null) {
		return null;
	}
	const scopeId = parsed.scopeId;
	return {
		action: parsed.actionCode,
		resource: parsed.resourceCode,
		field: parsed.fieldName === '' ? undefined : parsed.fieldName,
		scope: parsed.scope,
		orgId: parsed.scope === ResourceScope.Org ? scopeId : undefined,
		orgUnitId: parsed.scope === ResourceScope.OrgUnit ? scopeId : undefined,
	};
}
