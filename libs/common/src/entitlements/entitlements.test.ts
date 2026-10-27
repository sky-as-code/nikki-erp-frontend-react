/**
 * Parity with the backend evaluator.
 *
 * Every scenario here is ported verbatim from `parity_test.go`
 * (`nikkierp/modules/core/requestguard`). That file is a three-way harness keeping the in-memory
 * guard, the candidate set and the SQL matcher in agreement; this is the fourth executor, and it
 * must agree with them too. When a case changes on the backend, change it here in the same commit
 * — a UI that shows what the API refuses (or hides what it allows) is the defect this prevents.
 */

import { describe, expect, it } from 'vitest';

import { candidateExpressions } from './candidates';
import {
	buildExpression, buildFieldExpression, isKnownScope, omnipotentExpression, parseExpression, ResourceScope,
} from './expression';
import {
	checkAnyFieldEntitlement, checkEntitlements, checkFieldEntitlements, grantedFields, hasEntitlement,
	requirementFromExpression, requirementToExpression, type EntitlementContext, type EntitlementRequirement,
} from './guard';


const ORG1 = 'ORG1';
const UNIT1 = 'OU1';

function context(entitlements: string[], overrides: Partial<EntitlementContext> = {}): EntitlementContext {
	return { entitlements, userOrgIds: [], ...overrides };
}

function req(
	action: string, resource: string, scope: string, extra: Partial<EntitlementRequirement> = {},
): EntitlementRequirement {
	return { action, resource, scope, ...extra };
}

describe('parity with requestguard/parity_test.go', () => {
	const scenarios: Array<{
		name: string,
		grants?: string[],
		required: EntitlementRequirement,
		ctx?: Partial<EntitlementContext>,
		expected: boolean,
	}> = [
		{
			name: 'owner is allowed without holding anything',
			required: req('create', 'iam_user', ResourceScope.Tenant),
			ctx: { isOwner: true },
			expected: true,
		},
		{
			name: 'no grants denies',
			required: req('create', 'iam_user', ResourceScope.Tenant),
			expected: false,
		},
		{
			name: 'exact tenant grant',
			grants: ['create:iam_user:tenant'],
			required: req('create', 'iam_user', ResourceScope.Tenant),
			expected: true,
		},
		{
			name: 'omnipotent grant answers everything',
			grants: ['*:*:*'],
			required: req('delete', 'inventory_product', ResourceScope.OrgUnit, { orgUnitId: UNIT1 }),
			expected: true,
		},
		{
			// D4 regression: the SQL matcher used to omit this candidate entirely.
			name: 'action wildcard at tenant answers an org question',
			grants: ['create:*:tenant'],
			required: req('create', 'iam_user', ResourceScope.Org, { orgId: ORG1 }),
			expected: true,
		},
		{
			name: 'resource wildcard at tenant answers an org question',
			grants: ['*:iam_user:tenant'],
			required: req('create', 'iam_user', ResourceScope.Org, { orgId: ORG1 }),
			expected: true,
		},
		{
			name: 'exact org grant answers its own org',
			grants: ['create:iam_user:org/ORG1'],
			required: req('create', 'iam_user', ResourceScope.Org, { orgId: ORG1 }),
			expected: true,
		},
		{
			name: 'org grant does not answer a different org',
			grants: ['create:iam_user:org/ORG2'],
			required: req('create', 'iam_user', ResourceScope.Org, { orgId: ORG1 }),
			expected: false,
		},
		{
			name: 'bare org grant answers only for a member',
			grants: ['create:iam_user:org'],
			required: req('create', 'iam_user', ResourceScope.Org, { orgId: ORG1 }),
			ctx: { userOrgIds: [ORG1] },
			expected: true,
		},
		{
			name: 'bare org grant denies a non-member',
			grants: ['create:iam_user:org'],
			required: req('create', 'iam_user', ResourceScope.Org, { orgId: ORG1 }),
			ctx: { userOrgIds: ['ORG_OTHER'] },
			expected: false,
		},
		{
			name: 'exact unit grant answers its own unit',
			grants: ['create:iam_user:orgunit/OU1'],
			required: req('create', 'iam_user', ResourceScope.OrgUnit, { orgUnitId: UNIT1 }),
			expected: true,
		},
		{
			name: 'unit grant does not answer a different unit',
			grants: ['create:iam_user:orgunit/OU_OTHER'],
			required: req('create', 'iam_user', ResourceScope.OrgUnit, { orgUnitId: UNIT1 }),
			expected: false,
		},
		{
			// D4 regression: the matcher used to build an org expression carrying a unit id.
			name: "org grant for the unit's org answers a unit question",
			grants: ['create:iam_user:org/ORG1'],
			required: req('create', 'iam_user', ResourceScope.OrgUnit, { orgUnitId: UNIT1, orgId: ORG1 }),
			expected: true,
		},
		{
			name: 'bare unit grant answers when the caller is in that unit',
			grants: ['create:iam_user:orgunit'],
			required: req('create', 'iam_user', ResourceScope.OrgUnit, { orgUnitId: UNIT1 }),
			ctx: { orgUnitId: UNIT1 },
			expected: true,
		},
		{
			name: 'bare unit grant denies a caller in a different unit',
			grants: ['create:iam_user:orgunit'],
			required: req('create', 'iam_user', ResourceScope.OrgUnit, { orgUnitId: UNIT1 }),
			ctx: { orgUnitId: 'OU_OTHER' },
			expected: false,
		},
		{
			name: 'a parent unit grant does not reach a child unit',
			grants: ['create:iam_user:orgunit/OU_PARENT'],
			required: req('create', 'iam_user', ResourceScope.OrgUnit, { orgUnitId: 'OU_CHILD' }),
			expected: false,
		},
		{
			name: "private grant answers for the caller's own record",
			grants: ['view:iam_user:private'],
			required: req('view', 'iam_user', ResourceScope.Private, { isRecordOwnedByCaller: true }),
			expected: true,
		},
		{
			name: "private grant denies someone else's record",
			grants: ['view:iam_user:private'],
			required: req('view', 'iam_user', ResourceScope.Private, { isRecordOwnedByCaller: false }),
			expected: false,
		},
		{
			name: "a private grant answers an org question about the caller's own record",
			grants: ['update:iam_user:private'],
			required: req('update', 'iam_user', ResourceScope.Org, { orgId: ORG1, isRecordOwnedByCaller: true }),
			expected: true,
		},
		{
			name: "a private grant does not answer an org question about another's record",
			grants: ['update:iam_user:private'],
			required: req('update', 'iam_user', ResourceScope.Org, { orgId: ORG1 }),
			expected: false,
		},
		{
			name: "a private field grant answers a tenant field question about the caller's own record",
			grants: ['read:iam_user.email:private'],
			required: req('read', 'iam_user', ResourceScope.Tenant, { field: 'email', isRecordOwnedByCaller: true }),
			expected: true,
		},
		{
			name: 'a narrower grant does not satisfy a wider requirement',
			grants: ['create:iam_user:org/ORG1'],
			required: req('create', 'iam_user', ResourceScope.Tenant),
			expected: false,
		},
		{
			name: 'the wrong action denies',
			grants: ['view:iam_user:tenant'],
			required: req('delete', 'iam_user', ResourceScope.Tenant),
			expected: false,
		},
		{
			name: 'a resource grant answers a field question',
			grants: ['update:iam_user:tenant'],
			required: req('update', 'iam_user', ResourceScope.Tenant, { field: 'display_name' }),
			expected: true,
		},
		{
			name: 'a field grant answers its own field',
			grants: ['update:iam_user.display_name:tenant'],
			required: req('update', 'iam_user', ResourceScope.Tenant, { field: 'display_name' }),
			expected: true,
		},
		{
			name: 'a field grant does not answer another field',
			grants: ['update:iam_user.display_name:tenant'],
			required: req('update', 'iam_user', ResourceScope.Tenant, { field: 'email' }),
			expected: false,
		},
		{
			name: 'a field grant does not answer the whole resource',
			grants: ['update:iam_user.display_name:tenant'],
			required: req('update', 'iam_user', ResourceScope.Tenant),
			expected: false,
		},
		{
			name: "an org field grant answers a member's field question",
			grants: ['read:iam_user.email:org'],
			required: req('read', 'iam_user', ResourceScope.Org, { orgId: ORG1, field: 'email' }),
			ctx: { userOrgIds: [ORG1] },
			expected: true,
		},
		{
			name: "a private field grant denies someone else's record",
			grants: ['read:iam_user.email:private'],
			required: req('read', 'iam_user', ResourceScope.Private, { field: 'email' }),
			expected: false,
		},
		{
			name: 'the wrong resource denies',
			grants: ['create:iam_group:tenant'],
			required: req('create', 'iam_user', ResourceScope.Tenant),
			expected: false,
		},
	];

	it.each(scenarios)('$name', ({ grants, required, ctx, expected }) => {
		expect(hasEntitlement(required, context(grants ?? [], ctx))).toBe(expected);
	});
});

describe('buildExpression', () => {
	it('builds each wildcard combination', () => {
		expect(buildExpression('create', 'iam_user', ResourceScope.Tenant)).toBe('create:iam_user:tenant');
		expect(buildExpression('', 'iam_user', ResourceScope.Tenant)).toBe('*:iam_user:tenant');
		expect(buildExpression('create', '', ResourceScope.Tenant)).toBe('create:*:tenant');
		expect(buildExpression('', '', ResourceScope.Tenant)).toBe('*:*:tenant');
	});

	it('appends a scope id only when one is given', () => {
		expect(buildExpression('create', 'iam_user', ResourceScope.Org, ORG1)).toBe('create:iam_user:org/ORG1');
		expect(buildExpression('create', 'iam_user', ResourceScope.Org, null)).toBe('create:iam_user:org');
	});

	it('has one omnipotent form', () => {
		expect(omnipotentExpression()).toBe('*:*:*');
	});
});

describe('parseExpression', () => {
	it('round-trips a valid expression', () => {
		const parsed = parseExpression('create:iam_user:org/ORG1');
		expect(parsed).toEqual({
			actionCode: 'create', resourceCode: 'iam_user', fieldName: '', scope: 'org', scopeId: 'ORG1',
		});
	});

	it('accepts the omnipotent expression', () => {
		expect(parseExpression('*:*:*')).toEqual({
			actionCode: '*', resourceCode: '*', fieldName: '', scope: '*',
		});
	});

	it('round-trips a field-level expression', () => {
		expect(parseExpression('update:iam_user.display_name:tenant')).toEqual({
			actionCode: 'update', resourceCode: 'iam_user', fieldName: 'display_name', scope: 'tenant',
		});
		expect(buildFieldExpression('update', 'iam_user', 'display_name', ResourceScope.Org, ORG1))
			.toBe('update:iam_user.display_name:org/ORG1');
	});

	it.each([
		['too many segments', 'create:iam_user:tenant:extra'],
		['empty action', ':iam_user:tenant'],
		['empty resource', 'create::tenant'],
		['tenant carrying an id', 'create:iam_user:tenant/ORG1'],
		['unknown scope', 'create:iam_user:galaxy'],
		['wildcard scope without wildcard action', 'create:*:*'],
		['empty scope id', 'create:iam_user:org/'],
		['overlong segment', `read:${'a'.repeat(129)}:tenant`],
		['empty field', 'read:iam_user.:tenant'],
		['field of no resource', 'read:.display_name:tenant'],
		['field of any resource', 'read:*.display_name:tenant'],
		['wildcard field', 'read:iam_user.*:tenant'],
		['nested field', 'read:iam_user.a.b:tenant'],
		['non-snake field', 'read:iam_user.Display-Name:tenant'],
	])('rejects %s', (_name, expr) => {
		expect(parseExpression(expr)).toBeNull();
	});

	it('accepts a segment exactly at the limit', () => {
		expect(parseExpression(`read:${'a'.repeat(128)}:tenant`)).not.toBeNull();
	});
});

describe('isKnownScope', () => {
	it('knows the four scopes and nothing else', () => {
		expect(['tenant', 'org', 'orgunit', 'private'].every(isKnownScope)).toBe(true);
		expect(isKnownScope('domain')).toBe(false);
		expect(isKnownScope('*')).toBe(false);
	});
});

describe('candidateExpressions', () => {
	it('always offers the omnipotent grant first, then the tenant variants', () => {
		const candidates = candidateExpressions(
			{ actionCode: 'create', resourceCode: 'iam_user', scope: ResourceScope.Tenant },
			{ userOrgIds: [] },
		);
		expect(candidates[0]).toBe('*:*:*');
		expect(candidates).toEqual([
			'*:*:*',
			'create:iam_user:tenant', '*:iam_user:tenant', 'create:*:tenant', '*:*:tenant',
		]);
	});

	it('answers a field question with the field grants, then the resource-level ones', () => {
		const candidates = candidateExpressions(
			{ actionCode: 'update', resourceCode: 'iam_user', fieldName: 'display_name', scope: ResourceScope.Tenant },
			{ userOrgIds: [] },
		);
		expect(candidates).toEqual([
			'*:*:*',
			'update:iam_user.display_name:tenant', '*:iam_user.display_name:tenant',
			'update:iam_user:tenant', '*:iam_user:tenant', 'update:*:tenant', '*:*:tenant',
		]);
	});

	it('returns no duplicates', () => {
		const candidates = candidateExpressions(
			{ actionCode: '*', resourceCode: '*', scope: ResourceScope.Org, orgId: ORG1 },
			{ userOrgIds: [ORG1] },
		);
		expect(candidates).toEqual([...new Set(candidates)]);
	});
});

describe('checkEntitlements', () => {
	it('requires every requirement to hold, and names the ones that do not', () => {
		const ctx = context(['read:products:tenant']);

		const decision = checkEntitlements([
			req('read', 'products', ResourceScope.Tenant),
			req('update', 'products', ResourceScope.Tenant),
		], ctx);

		expect(decision.allowed).toBe(false);
		expect(decision.missing).toEqual(['update:products:tenant']);
	});

	it('allows when nothing is missing', () => {
		const ctx = context(['*:*:*']);

		expect(checkEntitlements([req('delete', 'products', ResourceScope.Tenant)], ctx))
			.toEqual({ allowed: true, missing: [] });
	});

	it('names an org-scoped requirement with its org id, as the backend would', () => {
		const decision = checkEntitlements(
			[req('update', 'products', ResourceScope.Org, { orgId: ORG1 })], context([]),
		);
		expect(decision.missing).toEqual(['update:products:org/ORG1']);
	});
});

describe('field-level checks', () => {
	const update = req('update', 'iam_user', ResourceScope.Tenant);
	const fields = ['display_name', 'email', 'status'];

	it('lets a resource grant cover every field', () => {
		const ctx = context(['update:iam_user:tenant']);
		expect(checkFieldEntitlements(update, fields, ctx)).toEqual({ allowed: true, missing: [] });
		expect(grantedFields(update, fields, ctx)).toEqual(fields);
	});

	it('names every field a field-only caller lacks, sorted', () => {
		const ctx = context(['update:iam_user.display_name:tenant']);
		expect(checkFieldEntitlements(update, ['status', 'display_name', 'email'], ctx)).toEqual({
			allowed: false, missing: ['update:iam_user.email:tenant', 'update:iam_user.status:tenant'],
		});
		expect(grantedFields(update, fields, ctx)).toEqual(['display_name']);
	});

	it('gates the action on the resource or any one field', () => {
		expect(checkAnyFieldEntitlement(update, fields, context(['update:iam_user.email:tenant'])).allowed).toBe(true);
		expect(checkAnyFieldEntitlement(update, fields, context(['update:iam_user.other:tenant']))).toEqual({
			allowed: false, missing: ['update:iam_user:tenant'],
		});
	});
});

describe('requirementFromExpression', () => {
	it('keeps the field of a field-level literal', () => {
		const requirement = requirementFromExpression('update:iam_user.display_name:tenant');
		expect(requirement).toMatchObject({ resource: 'iam_user', field: 'display_name' });
		expect(requirementToExpression(requirement!)).toBe('update:iam_user.display_name:tenant');
	});

	it('parses a literal into a requirement and back', () => {
		const requirement = requirementFromExpression('update:products:org/ORG1');
		expect(requirement).toMatchObject({ action: 'update', resource: 'products', scope: 'org', orgId: ORG1 });
		expect(requirementToExpression(requirement!)).toBe('update:products:org/ORG1');
	});

	it('returns null for a malformed literal, so callers can treat it as not granted', () => {
		expect(requirementFromExpression('nonsense')).toBeNull();
	});
});
