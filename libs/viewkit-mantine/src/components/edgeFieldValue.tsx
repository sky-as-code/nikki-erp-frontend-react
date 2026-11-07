import { TranslatableText } from '@nikkierp/ui/components';
import { toLangJson } from '@nikkierp/ui/components/ExcelDataTable';
import React from 'react';
import { useParams } from 'react-router-dom';

import { edgeDisplay } from '../data/edgeDisplay';
import { readFieldValue } from '../data/fieldPaths';
import { useModuleRoutes } from '../data/moduleRoutes';
import { resolveRouteModule, useOwnerSlugOf } from '../data/resourceHref';
import { ResourceLink } from './resourceLink/ResourceLink';

import type * as dyn from '@nikkierp/common/dynamicModel';


/**
 * The display name of the record a foreign key points at, linked to that record.
 *
 * A React component rather than an `IFieldRenderer`: a renderer receives only
 * `(rawValue, translatedValue)` — no record, no schema, no context, and no ability to call hooks
 * — and the detail view never consults the renderer registry at all. Only tables do.
 *
 * The edge object arrives on the record because the BFF's labelled detail selected `edge.label`;
 * the server projects the edge's own id alongside it, so the href needs no second request. The
 * branching lives in {@link edgeDisplay}, which is tested on its own.
 */
export function EdgeFieldValue({
	relation, labelField, fieldValues, fallback,
}: {
	relation: dyn.ModelSchemaRelation,
	/** The edge's label field, from the labelled detail's `meta.edge_labels`. */
	labelField: string | undefined,
	fieldValues: Record<string, unknown>,
	/** Rendered whenever the edge cannot be shown as a label — normally the raw id. */
	fallback: React.ReactNode,
}): React.ReactNode {
	const ownerSlugOf = useOwnerSlugOf();
	const moduleRoutes = useModuleRoutes();
	const params = useParams();
	const edge = readFieldValue(fieldValues, relation.edge) as Record<string, unknown> | null;
	// The module serving the destination: this one when it has the page (or a proxy copy of it), else
	// the micro-app owning the schema.
	const targetSlug = moduleRoutes
		? resolveRouteModule({
			routePath: relation.dest_schema_name, currentSlug: params.moduleSlug, moduleRoutes, ownerSlugOf,
		})
		: ownerSlugOf(relation.dest_schema_name);
	const display = edgeDisplay(relation, labelField, edge, targetSlug);

	if (display.kind === 'fallback') {
		return fallback;
	}

	// A record label may be a LangJson document, so it is localized rather than interpolated.
	const text = typeof display.label === 'object'
		? <TranslatableText langJson={toLangJson(display.label)} />
		: String(display.label);

	if (display.kind === 'text') {
		return text;
	}
	return (
		<ResourceLink schemaName={relation.dest_schema_name} recordId={String(edge?.['id'])}>{text}</ResourceLink>
	);
}
