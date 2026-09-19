import { Anchor } from '@mantine/core';
import { toLangJson } from '@nikkierp/ui/components/DataTable';
import { JsonLangText } from '@nikkierp/ui/i18n';
import { useMicroAppManager } from '@nikkierp/ui/microApp';
import React from 'react';
import { Link } from 'react-router';

import { readFieldValue } from '../data/displayedFields';
import { edgeDisplay } from '../data/edgeLabelFields';

import type * as dyn from '@nikkierp/common/dynamicModel';


/**
 * The display name of the record a foreign key points at, linked to that record.
 *
 * A React component rather than an `IFieldRenderer`: a renderer receives only
 * `(rawValue, translatedValue)` — no record, no schema, no context, and no ability to call hooks
 * — and the detail view never consults the renderer registry at all. Only tables do.
 *
 * The edge object arrives on the record because the detail fetch selected `edge.label`; the
 * server projects the edge's own id alongside it, so the href needs no second request. The
 * branching lives in {@link edgeDisplay}, which is tested on its own.
 */
export function EdgeFieldValue({
	relation, destSchema, fieldValues, fallback,
}: {
	relation: dyn.ModelSchemaRelation,
	destSchema: dyn.ModelSchema | undefined,
	fieldValues: Record<string, unknown>,
	/** Rendered whenever the edge cannot be shown as a label — normally the raw id. */
	fallback: React.ReactNode,
}): React.ReactNode {
	const manager = useMicroAppManager();
	const edge = readFieldValue(fieldValues, relation.edge) as Record<string, unknown> | null;
	const display = edgeDisplay(
		relation, destSchema, edge, manager.findOwnerSlug(relation.dest_schema_name),
	);

	if (display.kind === 'fallback') {
		return fallback;
	}

	// A record label may be a LangJson document, so it is localized rather than interpolated.
	const text = typeof display.label === 'object'
		? <JsonLangText langJson={toLangJson(display.label)} />
		: String(display.label);

	if (display.kind === 'text') {
		return text;
	}
	return <Anchor component={Link} to={display.href}>{text}</Anchor>;
}
