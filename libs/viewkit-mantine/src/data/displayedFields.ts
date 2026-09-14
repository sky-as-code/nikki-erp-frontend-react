import type { ResourceListDisplayedField } from '../pages/resourceList/props';
import type * as dyn from '@nikkierp/common/dynamicModel';


export type DisplayedFieldLabels = Record<string, string>;

/**
 * The field names to request, in the order the page declared them.
 *
 * Returns undefined for an undeclared list so the request carries no `fields` at all, which is
 * what makes the server fall back to the model's `default_search_fields`. Sending an empty array
 * instead would ask for no columns and render a header-less table.
 */
export function displayedFieldNames(
	displayedFields: ResourceListDisplayedField[] | undefined,
): string[] | undefined {
	if (!displayedFields || displayedFields.length === 0) {
		return undefined;
	}
	return displayedFields.map(entry => typeof entry === 'string' ? entry : entry.field);
}

/**
 * The explicit header labels, keyed by field name.
 *
 * Only the object form contributes: a bare string defers to the schema's own field label, and
 * mapping it here would freeze a translation the backend is responsible for.
 */
export function displayedFieldLabelKeys(
	displayedFields: ResourceListDisplayedField[] | undefined,
): DisplayedFieldLabels {
	const labels: DisplayedFieldLabels = {};
	for (const entry of displayedFields ?? []) {
		if (typeof entry !== 'string') {
			labels[entry.field] = entry.label;
		}
	}
	return labels;
}

/**
 * Resolves a field name that may reach through one edge, e.g. `product_template.name`.
 *
 * A dotted name has no entry in `schema.fields` — that map is flat — so every caller that looks a
 * column up by name has to walk the edge instead: find the edge, then the field on the schema it
 * points at. Returns undefined when either half is unknown, leaving callers on their existing
 * fallback rather than throwing on a page that merely names a field the schema dropped.
 */
export function resolveSchemaField(
	schema: dyn.ModelSchema | undefined,
	field: string,
	schemasByName?: (name: string) => dyn.ModelSchema | undefined,
): dyn.ModelSchemaField | undefined {
	if (!schema) {
		return undefined;
	}
	const dot = field.indexOf('.');
	if (dot < 0) {
		return schema.fields[field];
	}
	const edgeName = field.slice(0, dot);
	const leafName = field.slice(dot + 1);
	const destSchemaName = relationDestSchemaName(schema, edgeName);
	const destSchema = destSchemaName ? schemasByName?.(destSchemaName) : undefined;
	return destSchema?.fields[leafName];
}

/**
 * Reads the value of a possibly-dotted field off a row.
 *
 * The server nests a selected edge field under the edge name — `product_template.name` arrives as
 * `{ product_template: { name } }`, not as a flat `'product_template.name'` key — so the path has
 * to be walked rather than used as an index.
 */
export function readFieldValue(row: Record<string, unknown> | undefined, field: string): unknown {
	if (!row) {
		return undefined;
	}
	if (!field.includes('.')) {
		return row[field];
	}
	let current: unknown = row;
	for (const segment of field.split('.')) {
		if (current == null || typeof current !== 'object') {
			return undefined;
		}
		current = (current as Record<string, unknown>)[segment];
	}
	return current;
}

/** The schema an edge points at, or undefined when the name is not an edge of this schema. */
export function relationDestSchemaName(
	schema: dyn.ModelSchema | undefined, edgeName: string,
): string | undefined {
	const relations = [...(schema?.to_relations ?? []), ...(schema?.from_relations ?? [])];
	return relations.find(relation => relation.edge === edgeName)?.dest_schema_name;
}

/** The edge names a list's displayed fields reach through, deduplicated. */
export function displayedEdgeNames(fieldNames: string[] | undefined): string[] {
	const edges = (fieldNames ?? [])
		.filter(field => field.includes('.'))
		.map(field => field.slice(0, field.indexOf('.')));
	return Array.from(new Set(edges));
}
