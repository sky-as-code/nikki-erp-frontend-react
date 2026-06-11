export type ConditionOperator =
	| 'equal' | 'not_equal'
	| 'in' | 'not_in'
	| 'gt' | 'gte' | 'lt' | 'lte'
	| 'exists' | 'not_exists';

/**
 * Serializable replacement for JS predicate functions in metadata JSON.
 * Example: `{ field: 'status', operator: 'not_equal', value: 'active' }`.
 */
export type ConditionExpression = {
	field: string,
	operator: ConditionOperator,
	value?: unknown,
};

export function evaluateCondition(expr: ConditionExpression, resource: Record<string, unknown>): boolean {
	const actual = readPath(resource, expr.field);
	switch (expr.operator) {
		case 'equal': return actual === expr.value;
		case 'not_equal': return actual !== expr.value;
		case 'in': return Array.isArray(expr.value) && expr.value.includes(actual);
		case 'not_in': return !Array.isArray(expr.value) || !expr.value.includes(actual);
		case 'gt': case 'gte': case 'lt': case 'lte':
			return compareNumeric(expr.operator, actual, expr.value);
		case 'exists': return actual !== undefined && actual !== null;
		case 'not_exists': return actual === undefined || actual === null;
		default: return false;
	}
}

function compareNumeric(operator: ConditionOperator, actual: unknown, expected: unknown): boolean {
	if (typeof actual !== 'number' || typeof expected !== 'number') {
		return false;
	}
	switch (operator) {
		case 'gt': return actual > expected;
		case 'gte': return actual >= expected;
		case 'lt': return actual < expected;
		case 'lte': return actual <= expected;
		default: return false;
	}
}

function readPath(resource: Record<string, unknown>, path: string): unknown {
	if (!path.includes('.')) {
		return resource[path];
	}
	return path.split('.').reduce<unknown>((acc, segment) => {
		if (acc === null || acc === undefined || typeof acc !== 'object') {
			return undefined;
		}
		return (acc as Record<string, unknown>)[segment];
	}, resource);
}

