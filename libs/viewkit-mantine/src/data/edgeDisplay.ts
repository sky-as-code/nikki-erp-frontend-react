import type * as dyn from '@nikkierp/common/dynamicModel';


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
 * `labelField` is the destination's `record_label_field` as the BFF's labelled detail named it
 * (`meta.edge_labels[edge]`), undefined when the read selected no label for this edge.
 * `ownerSlug` is the micro-app owning the destination schema, or undefined when none is
 * registered.
 */
export function edgeDisplay(
	relation: dyn.ModelSchemaRelation,
	labelField: string | undefined,
	edge: Record<string, unknown> | null | undefined,
	ownerSlug: string | undefined,
): EdgeDisplay {
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
