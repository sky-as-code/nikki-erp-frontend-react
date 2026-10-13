import type * as dyn from '@nikkierp/common/dynamicModel';


/** A to-one edge and the destination schema its label has to come from. */
export type EdgeLabelTarget = {
	edge: string,
	destSchemaName: string,
};

/**
 * The to-one edges of `schema`, as `{edge, destSchemaName}`.
 *
 * Only to-one edges qualify. A `one:many` or `many:many` relation fans out to a list of records,
 * which has no single label to show on a detail field — and the server refuses a nested selection
 * through a to-many edge outright (`err_graph_nested_beyond_to_many`). The `src_field` test
 * carries this: m2m entries have no source column, so they never match.
 */
export function toOneEdgeTargets(schema: dyn.ModelSchema | undefined): EdgeLabelTarget[] {
	const relations = schema?.to_relations ?? [];
	return relations
		.filter(relation => Boolean(relation.src_field) && isToOne(relation.relation_type))
		.map(relation => ({ edge: relation.edge, destSchemaName: relation.dest_schema_name }));
}

function isToOne(relationType: dyn.ModelSchemaRelationType): boolean {
	return relationType === 'many:one' || relationType === 'one:one';
}

/** What a read-mode edge field should display. */
export type EdgeDisplay =
	/** No edge object, no label, or no id: show whatever the field showed before. */
	| { kind: 'fallback' }
	/** A label but nowhere to point: the owning micro-app is not registered. */
	| { kind: 'text', label: unknown }
	| { kind: 'link', label: unknown, href: string };

/**
 * Whether a read-mode edge renders as a link, as bare text, or not at all.
 *
 * Split from the component so the decision can be tested as data: the component around it is
 * three lines of JSX, while these branches are the part that has to stay correct.
 *
 * `ownerSlug` is the micro-app owning the destination schema, or undefined when none is
 * registered.
 */
export function edgeDisplay(
	relation: dyn.ModelSchemaRelation,
	destSchema: dyn.ModelSchema | undefined,
	edge: Record<string, unknown> | null | undefined,
	ownerSlug: string | undefined,
): EdgeDisplay {
	const labelField = destSchema?.record_label_field;
	if (!edge || !labelField) {
		return { kind: 'fallback' };
	}
	const label = edge[labelField];
	if (label === null || label === undefined || label === '') {
		return { kind: 'fallback' };
	}
	const id = edge['id'];
	if (!ownerSlug || typeof id !== 'string' || id === '') {
		return { kind: 'text', label };
	}
	return { kind: 'link', label, href: `/${ownerSlug}/${relation.dest_schema_name}/${id}` };
}

/**
 * The record's own columns, as a get-detail selection.
 *
 * Mirrors the projection the server falls back to when no `fields` is sent — `ReadableFields()`,
 * every field that is not an edge model. It has to be sent explicitly as soon as *anything* is
 * selected, because `fields` replaces that default rather than adding to it: asking for only
 * `uom.name` would return a record consisting of the uom and nothing else.
 */
export function ownFieldNames(schema: dyn.ModelSchema | undefined): string[] {
	return Object.values(schema?.fields ?? {})
		.filter(field => !field.is_edge_model)
		.map(field => field.name);
}

/**
 * The dotted field selections that fetch each edge's display label, e.g. `['uom.name']`.
 *
 * An edge whose destination declares no `record_label_field` is **skipped**, not requested as
 * `edge.id`: the id is already on the row as the foreign key, so selecting it again would add a
 * join for nothing. The detail view falls back to showing that raw id, which is what it does
 * today.
 *
 * `destSchemas` is keyed by schema name and is expected to be incomplete while those schemas are
 * still loading — a missing entry yields no selection, so the caller must wait for them rather
 * than treat the result as final.
 */
export function edgeLabelFieldNames(
	schema: dyn.ModelSchema | undefined,
	destSchemas: Record<string, dyn.ModelSchema>,
): string[] {
	return toOneEdgeTargets(schema)
		.map(target => {
			const labelField = destSchemas[target.destSchemaName]?.record_label_field;
			return labelField ? `${target.edge}.${labelField}` : null;
		})
		.filter((field): field is string => field !== null);
}

/** A search request with the edge label selections it needs, and which of them were added. */
export type EdgeLabelRequest = {
	request: dyn.RestSearchRequest,
	added: string[],
};

/**
 * Adds the label of every to-one edge whose foreign key the request selects, e.g.
 * `parking_lot_id` brings `parking_lot.name`, so the table can show the related record's label
 * where it would show the raw id (`resolveEdgeLabel`).
 *
 * A request without `fields` gets the server's own fallback written out first —
 * `default_search_fields`, else the record's own columns — because `fields` replaces that default
 * rather than adding to it. A request that needs no label is returned untouched, so it still
 * sends no `fields` at all.
 *
 * `added` lists only what the caller did not ask for; `stripAddedFields` takes exactly those back
 * out of the response, so the table never shows a column it did not request.
 */
export function withEdgeLabelFields(
	request: dyn.RestSearchRequest,
	schema: dyn.ModelSchema,
	destSchemas: Record<string, dyn.ModelSchema>,
): EdgeLabelRequest {
	const base = request.fields ?? defaultSearchFieldNames(schema);
	const selected = new Set(base);
	const toOneEdges = new Set(toOneEdgeTargets(schema).map(target => target.edge));
	const added = (schema.to_relations ?? [])
		.filter(relation => toOneEdges.has(relation.edge) && selected.has(relation.src_field ?? ''))
		.map(relation => {
			const labelField = destSchemas[relation.dest_schema_name]?.record_label_field;
			return labelField ? `${relation.edge}.${labelField}` : null;
		})
		.filter((field): field is string => field !== null && !selected.has(field));
	if (added.length === 0) {
		return { request, added };
	}
	return { request: { ...request, fields: [...base, ...added] }, added };
}

/**
 * The response as the caller requested it: the label selections `withEdgeLabelFields` added are
 * dropped from its columns. The rows keep the edge objects, which is where the labels are read.
 */
export function stripAddedFields<TData extends { desired_fields: string[] }>(data: TData, added: string[]): TData {
	if (added.length === 0) {
		return data;
	}
	const extra = new Set(added);
	return { ...data, desired_fields: data.desired_fields.filter(field => !extra.has(field)) };
}

function defaultSearchFieldNames(schema: dyn.ModelSchema): string[] {
	const defaults = schema.default_search_fields ?? [];
	return defaults.length > 0 ? defaults : ownFieldNames(schema);
}
