/**
 * Server-side twin of the frontend's former `libs/viewkit-mantine/src/data/edgeLabelFields.ts`: which dotted
 * `edge.label` selections a list or detail read needs so a to-one edge shows its record's label, not its id.
 */

/** In `fields`, every readable own field of the root record (the backend expands it). */
export const ALL_FIELDS = '*';

export type SchemaRelation = {
	readonly edge?: unknown;
	readonly src_field?: unknown;
	readonly dest_schema_name?: unknown;
	readonly relation_type?: unknown;
};

/** The part of a business-service `meta/schema` body this module reads. */
export type ViewSchema = {
	readonly fields?: Record<string, { readonly name?: unknown; readonly is_edge_model?: unknown }>;
	readonly to_relations?: readonly SchemaRelation[];
	readonly default_search_fields?: readonly string[];
	readonly record_label_field?: unknown;
};

/** A to-one edge, its foreign key, and the destination schema its label comes from. */
export type ToOneEdge = { readonly edge: string; readonly srcField: string; readonly destSchemaName: string };

export type EdgeLabelSelection = {
	/** The `fields` to send upstream. */
	readonly fields: string[];
	/** The selections the caller did not ask for, to strip from `desired_fields`. */
	readonly added: string[];
	/** `{<edge>: <label field>}` for every edge whose label the response carries. */
	readonly edgeLabels: Record<string, string>;
};

/**
 * The to-one edges of `schema`. A `one:many` or `many:many` relation has no single label, and the server refuses a
 * nested selection through it (`err_graph_nested_beyond_to_many`); m2m entries have no `src_field`, so they drop out.
 */
export function toOneEdges(schema: ViewSchema | undefined): ToOneEdge[] {
	const relations = Array.isArray(schema?.to_relations) ? schema.to_relations : [];
	return relations.flatMap((relation) => {
		const { edge, src_field: srcField, dest_schema_name: destSchemaName, relation_type: relationType } = relation;
		const isToOne = relationType === 'many:one' || relationType === 'one:one';
		if (!isToOne || !isName(edge) || !isName(srcField) || !isName(destSchemaName)) {
			return [];
		}
		return [{ edge, srcField, destSchemaName }];
	});
}

/** What `*` expands to on the server: every field that is not an edge model. */
export function ownFieldNames(schema: ViewSchema | undefined): string[] {
	return Object.values(schema?.fields ?? {})
		.filter((field) => !field.is_edge_model && isName(field.name))
		.map((field) => field.name as string);
}

/** The server's own projection when a list request names no `fields`: `default_search_fields`, else `*`. */
export function defaultListFields(schema: ViewSchema): string[] {
	const defaults = Array.isArray(schema.default_search_fields) ? schema.default_search_fields : [];
	return defaults.length > 0 ? [...defaults] : [ALL_FIELDS];
}

/**
 * `base` plus the label of every to-one edge whose foreign key it selects (`uom_id` brings `uom.name`). An edge whose
 * destination declares no `record_label_field` is skipped: its id is already on the row. A label the caller already
 * selected is not added again but still listed in `edgeLabels`.
 */
export function withEdgeLabelFields(
	base: readonly string[], schema: ViewSchema, destSchemas: Record<string, ViewSchema | undefined>,
): EdgeLabelSelection {
	const selected = new Set(base.includes(ALL_FIELDS) ? [...base, ...ownFieldNames(schema)] : base);
	const added: string[] = [];
	const edgeLabels: Record<string, string> = {};
	for (const target of toOneEdges(schema)) {
		const labelField = destSchemas[target.destSchemaName]?.record_label_field;
		if (!selected.has(target.srcField) || !isName(labelField)) {
			continue;
		}
		const selection = `${target.edge}.${labelField}`;
		edgeLabels[target.edge] = labelField;
		if (!selected.has(selection) && !added.includes(selection)) {
			added.push(selection);
		}
	}
	return { fields: [...base, ...added], added, edgeLabels };
}

function isName(value: unknown): value is string {
	return typeof value === 'string' && value !== '';
}
