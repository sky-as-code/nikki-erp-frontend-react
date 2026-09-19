import * as dyn from '@nikkierp/common/dynamicModel';
import { useCommandBus } from '@nikkierp/ui/microApp';
import React from 'react';

import { edgeLabelFieldNames, toOneEdgeTargets } from './edgeLabelFields';


export type EdgeLabelFields = {
	/** Dotted selections such as `['uom.name']`, empty until the edge schemas resolve. */
	fields: string[],
	/** The destination schemas, keyed by name, for a caller that also renders the labels. */
	destSchemas: Record<string, dyn.ModelSchema>,
	/** False while any edge schema is still loading. */
	isReady: boolean,
};

/**
 * The edge label selections to add to a detail fetch, and the schemas they came from.
 *
 * Sibling of `useRelatedSchemas`, which answers the same question for a *list*: there the edges
 * are named by the columns the page declared, here they are every to-one edge the schema has,
 * because a detail form shows all of them.
 *
 * `isReady` exists so the detail fetch can wait. The schemas resolve asynchronously — a
 * cross-module one can even trigger a micro-app load — so firing the request before they land
 * would fetch without labels and then refetch with them, visibly repainting the form.
 */
export function useEdgeLabelFields(schema: dyn.ModelSchema | undefined): EdgeLabelFields {
	const commandBus = useCommandBus();
	const [destSchemas, setDestSchemas] = React.useState<Record<string, dyn.ModelSchema>>({});
	// Which edge set `destSchemas` answers. Readiness is "the lookup for *these* edges has
	// settled", not "something resolved" — every schema can legitimately fail to resolve, and a
	// count-based test would leave the detail fetch waiting forever when they do.
	const [settledKey, setSettledKey] = React.useState<string | null>(null);

	const targets = React.useMemo(() => toOneEdgeTargets(schema), [schema]);
	// Joined rather than passed by reference: `targets` is a new array each render, and a
	// reference dependency would refetch on every one of them.
	const wantedKey = React.useMemo(
		() => Array.from(new Set(targets.map(target => target.destSchemaName))).sort().join(','),
		[targets],
	);

	React.useEffect(() => {
		const wanted = wantedKey ? wantedKey.split(',') : [];
		if (wanted.length === 0) {
			setDestSchemas({});
			setSettledKey(wantedKey);
			return;
		}
		let cancelled = false;
		// `catch` rather than bare `then`: an edge pointing at a schema no micro-app owns rejects,
		// and an unhandled rejection here would take the whole detail page down over a field that
		// is allowed to fall back to its raw id.
		void Promise.all(wanted.map(name => dyn.publishGetSchema(commandBus, name).catch(() => null)))
			.then(results => {
				if (cancelled) {
					return;
				}
				const next: Record<string, dyn.ModelSchema> = {};
				for (const pack of results) {
					if (pack?.modelSchema) {
						next[pack.schemaName] = pack.modelSchema;
					}
				}
				setDestSchemas(next);
				setSettledKey(wantedKey);
			});
		return () => {
			cancelled = true;
		};
	}, [commandBus, wantedKey]);

	return React.useMemo(() => ({
		fields: edgeLabelFieldNames(schema, destSchemas),
		destSchemas,
		// The schema itself has to be present, not just the edge lookup settled. Before it loads
		// there are no edges to look up, so the lookup trivially "settles" on an empty set — and a
		// caller gated only on that would fetch once without any edge fields, then again once the
		// schema arrived and real edges appeared. That second fetch is not merely wasteful: it
		// replaces the form's `modelValue`, and `CrudFormProvider` resets the form on that change,
		// discarding whatever the user had already edited. A save then sends nothing.
		isReady: schema !== undefined && settledKey === wantedKey,
	}), [schema, destSchemas, settledKey, wantedKey]);
}
