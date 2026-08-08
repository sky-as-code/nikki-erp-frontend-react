const PLACEHOLDER = /^\$\{([A-Za-z_][A-Za-z0-9_]*)\}$/;
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const MAX_DEPTH = 20;

export type RouteParams = Record<string, string | undefined>;

export type InterpolateResult<TValue> = {
	value: TValue,
	/** Placeholders whose param was absent; the leaf was left as-is. */
	missing: string[],
};

/**
 * Replaces whole-string `${param}` leaves in a plain-JSON value with route params.
 *
 * Only a *whole* string is substituted, never an embedded fragment: that keeps the
 * substituted value's type intact and leaves no string-splicing surface. There is no
 * expression evaluation of any kind — a filter graph is data, not a template language.
 */
export function interpolateParams<TValue>(value: TValue, params: RouteParams): InterpolateResult<TValue> {
	const missing: string[] = [];
	const result = walk(value, params, missing, 0) as TValue;
	return { value: result, missing };
}

function walk(value: unknown, params: RouteParams, missing: string[], depth: number): unknown {
	if (depth > MAX_DEPTH) {
		return value;
	}
	if (typeof value === 'string') {
		return substitute(value, params, missing);
	}
	if (Array.isArray(value)) {
		return value.map(item => walk(item, params, missing, depth + 1));
	}
	if (isPlainObject(value)) {
		return walkObject(value, params, missing, depth);
	}
	return value;
}

function walkObject(
	value: Record<string, unknown>, params: RouteParams, missing: string[], depth: number,
): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	for (const [key, item] of Object.entries(value)) {
		if (UNSAFE_KEYS.has(key)) {
			continue;
		}
		result[key] = walk(item, params, missing, depth + 1);
	}
	return result;
}

function substitute(value: string, params: RouteParams, missing: string[]): string {
	const match = PLACEHOLDER.exec(value);
	if (!match) {
		return value;
	}
	const name = match[1];
	const replacement = params[name];
	if (replacement === undefined) {
		missing.push(name);
		return value;
	}
	return replacement;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
