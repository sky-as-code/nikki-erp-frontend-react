/**
 * Entitlement expressions, ported from the backend's single producer.
 *
 * Reference: `nikkierp/modules/core/requestguard/expression.go`. The two implementations MUST
 * agree — a permission system whose "can I?" and "may I?" answers differ is a security defect,
 * not an inconsistency — so `expression.test.ts` mirrors the Go table tests case for case.
 *
 * Shape: `{action}:{resource}:{scope}[/{scopeId}]`, where action and resource may be the wildcard
 * `*`, and only the org / orgunit scopes carry an id.
 */

/** Matches any action or any resource. */
export const WILDCARD = '*';

/**
 * Bounds each segment. Nothing legitimate comes close: action and resource codes are short
 * identifiers and scope ids are ULIDs.
 */
const MAX_SEGMENT_LENGTH = 128;

export const ResourceScope = {
	Tenant: 'tenant',
	Org: 'org',
	OrgUnit: 'orgunit',
	Private: 'private',
} as const;

export type ResourceScope = (typeof ResourceScope)[keyof typeof ResourceScope];

const KNOWN_SCOPES: readonly string[] = Object.values(ResourceScope);

/** Reports whether the scope is one this system evaluates. */
export function isKnownScope(scope: string): scope is ResourceScope {
	return KNOWN_SCOPES.includes(scope);
}

export type ParsedExpression = {
	actionCode: string,
	resourceCode: string,
	scope: string,
	scopeId?: string,
};

/**
 * The only producer of expressions on the frontend, mirroring Go's `BuildExpression`. An empty
 * action or resource becomes the wildcard.
 */
export function buildExpression(
	actionCode: string, resourceCode: string, scope: string, scopeId?: string | null,
): string {
	const action = actionCode === '' ? WILDCARD : actionCode;
	const resource = resourceCode === '' ? WILDCARD : resourceCode;
	return scopeId
		? `${action}:${resource}:${scope}/${scopeId}`
		: `${action}:${resource}:${scope}`;
}

/** Grants everything, everywhere: the only expression whose scope segment is a wildcard. */
export function omnipotentExpression(): string {
	return `${WILDCARD}:${WILDCARD}:${WILDCARD}`;
}

/**
 * Decomposes an expression, or returns null if it is malformed.
 *
 * Strict on purpose, exactly as the backend parser is: a shape the server would reject must not be
 * treated here as a grant.
 */
export function parseExpression(expr: string): ParsedExpression | null {
	const segments = expr.split(':');
	if (segments.length !== 3) {
		return null;
	}

	const [action, resource, scopeSegment] = segments;
	if (action === '' || resource === '' || scopeSegment === '') {
		return null;
	}
	if (segments.some(segment => segment.length > MAX_SEGMENT_LENGTH)) {
		return null;
	}

	if (scopeSegment === WILDCARD) {
		// A wildcard scope is valid only in the omnipotent expression.
		if (action !== WILDCARD || resource !== WILDCARD) {
			return null;
		}
		return { actionCode: WILDCARD, resourceCode: WILDCARD, scope: WILDCARD };
	}

	const separatorAt = scopeSegment.indexOf('/');
	if (separatorAt < 0) {
		return isKnownScope(scopeSegment)
			? { actionCode: action, resourceCode: resource, scope: scopeSegment }
			: null;
	}

	const scope = scopeSegment.slice(0, separatorAt);
	const scopeId = scopeSegment.slice(separatorAt + 1);
	if (!isKnownScope(scope) || scopeId === '' || scopeId.includes('/')) {
		return null;
	}
	// Only org and orgunit are scoped to a particular one; tenant and private never carry an id.
	if (scope !== ResourceScope.Org && scope !== ResourceScope.OrgUnit) {
		return null;
	}

	return { actionCode: action, resourceCode: resource, scope, scopeId };
}
