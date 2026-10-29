import type * as dyn from '@nikkierp/common/dynamicModel';


/** The create page's query parameter that pre-fills its form: `?field_data=<URL-encoded JSON object>`. */
export const FIELD_DATA_PARAM = 'field_data';

/**
 * Reads the `field_data` query-string parameter: a URL-encoded JSON object of field values that
 * pre-fill a create form (e.g. `{"operation_code":"incoming"}`).
 *
 * Malformed input is dropped rather than surfaced, as `parseSearchGraphParam` does: the values only
 * seed the form, so a stale or hand-edited link should open the empty form instead of a dead page.
 */
export function parseFieldDataParam(raw: string | null | undefined): Record<string, unknown> | undefined {
	if (!raw) {
		return undefined;
	}
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	}
	catch {
		console.warn('[resourceCreate] ignoring a malformed `field_data` query parameter');
		return undefined;
	}
	if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
		console.warn('[resourceCreate] ignoring a `field_data` query parameter that is not a JSON object');
		return undefined;
	}
	return parsed as Record<string, unknown>;
}

/**
 * Keeps only the values naming a field of the model, so a link cannot slip arbitrary keys into the
 * create request. Returns `undefined` when nothing is left.
 */
export function pickSchemaFieldValues(
	values: Record<string, unknown> | undefined,
	modelSchema: Pick<dyn.ModelSchema, 'fields'>,
): Record<string, unknown> | undefined {
	if (!values) {
		return undefined;
	}
	const known = Object.entries(values).filter(([name]) => Object.hasOwn(modelSchema.fields, name));
	return known.length > 0 ? Object.fromEntries(known) : undefined;
}
