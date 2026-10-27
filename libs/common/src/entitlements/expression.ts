/**
 * Entitlement expressions, ported from the backend's single producer.
 *
 * Reference: `nikkierp/modules/core/requestguard/expression.go`. The two implementations MUST
 * agree — a permission system whose "can I?" and "may I?" answers differ is a security defect,
 * not an inconsistency — so `expression.test.ts` mirrors the Go table tests case for case.
 *
 * Shape: `{action}:{resource}[.{field}]:{scope}[/{scopeId}]`, where action and resource may be the
 * wildcard `*`, the optional field narrows the grant to one field of a named resource, and only the
 * org / orgunit scopes carry an id.
 */

/** Matches any action or any resource. */
export const WILDCARD = '*';

/**
 * Bounds each segment. Nothing legitimate comes close: action and resource codes are short
 * identifiers and scope ids are ULIDs.
 */
const MAX_SEGMENT_LENGTH = 128;

/** Splits a field-level resource segment `{resource}.{field}`. */
export const FIELD_SEPARATOR = '.';

/** A field name is one snake-case identifier: no wildcard, no second separator. */
const FIELD_NAME_PATTERN = /^[a-z0-9_]+$/;

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
	/** Empty for a resource-level expression. */
	fieldName: string,
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
	return buildFieldExpression(actionCode, resourceCode, '', scope, scopeId);
}

/** `buildExpression` for a field-level grant, mirroring Go's `BuildFieldExpression`. */
export function buildFieldExpression(
	actionCode: string, resourceCode: string, fieldName: string, scope: string, scopeId?: string | null,
): string {
	const action = actionCode === '' ? WILDCARD : actionCode;
	const resource = resourceSegment(resourceCode === '' ? WILDCARD : resourceCode, fieldName);
	return scopeId
		? `${action}:${resource}:${scope}/${scopeId}`
		: `${action}:${resource}:${scope}`;
}

/** The middle segment: the resource code, followed by the field name when there is one. */
export function resourceSegment(resourceCode: string, fieldName: string): string {
	return fieldName === '' ? resourceCode : `${resourceCode}${FIELD_SEPARATOR}${fieldName}`;
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
		return { actionCode: WILDCARD, resourceCode: WILDCARD, fieldName: '', scope: WILDCARD };
	}

	const target = splitResourceSegment(resource);
	if (target == null) {
		return null;
	}
	const base = { actionCode: action, ...target };
	const separatorAt = scopeSegment.indexOf('/');
	if (separatorAt < 0) {
		return isKnownScope(scopeSegment) ? { ...base, scope: scopeSegment } : null;
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

	return { ...base, scope, scopeId };
}

function splitResourceSegment(segment: string): { resourceCode: string, fieldName: string } | null {
	const separatorAt = segment.indexOf(FIELD_SEPARATOR);
	if (separatorAt < 0) {
		return { resourceCode: segment, fieldName: '' };
	}
	const resourceCode = segment.slice(0, separatorAt);
	const fieldName = segment.slice(separatorAt + 1);
	if (resourceCode === '' || resourceCode === WILDCARD || !FIELD_NAME_PATTERN.test(fieldName)) {
		return null;
	}
	return { resourceCode, fieldName };
}

/**
 * The entitlements to show a person who was refused: `action:resource:scope`, without the scope
 * id. The id names one org the reader cannot tell apart from a ULID, and repeating the same code
 * per org adds nothing an administrator acts on. A string that does not parse is kept verbatim.
 */
export function toDisplayedEntitlements(expressions: string[]): string[] {
	const displayed = expressions.map(expr => {
		const parsed = parseExpression(expr);
		return parsed
			? buildFieldExpression(parsed.actionCode, parsed.resourceCode, parsed.fieldName, parsed.scope)
			: expr;
	});
	return [...new Set(displayed)];
}
