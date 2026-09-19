import * as dyn from '@nikkierp/common/dynamicModel';
import { useCommandBus } from '@nikkierp/ui/microApp';
import React from 'react';

import { displayedEdgeNames, relationDestSchemaName } from './displayedFields';


/**
 * The schemas on the far side of the edges a list's columns reach through.
 *
 * A field like `product_template.name` describes a column of *another* resource, so its label,
 * data type and filter input all have to come from that resource's schema — the list's own
 * `fields` map is flat and has no entry for it. Only the edges actually named are fetched, and
 * each one only once: `publishGetSchema` reads through the shared registry cache, so a schema a
 * sibling page already loaded costs nothing.
 *
 * Empty while the requests are in flight, so callers must treat a miss as "not yet", not as "no
 * such field", and keep their existing fallback.
 */
export function useRelatedSchemas(
	schema: dyn.ModelSchema | undefined, fieldNames: string[] | undefined,
): Record<string, dyn.ModelSchema> {
	const commandBus = useCommandBus();
	const [packs, setPacks] = React.useState<Record<string, dyn.ModelSchema>>({});

	// Joined rather than passed by reference: the caller rebuilds this array every render, and a
	// reference dependency would refetch on each one.
	const edgeKey = displayedEdgeNames(fieldNames).join(',');
	const schemaName = schema?.name;

	React.useEffect(() => {
		const edges = edgeKey ? edgeKey.split(',') : [];
		const wanted = edges
			.map(edge => relationDestSchemaName(schema, edge))
			.filter((name): name is string => Boolean(name));
		if (wanted.length === 0) {
			return;
		}
		let cancelled = false;
		void Promise.all(wanted.map(name => dyn.publishGetSchema(commandBus, name)))
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
				// Replaced, not merged: the edges belong to the schema named below, so a schema
				// change must drop the previous resource's related schemas with it.
				setPacks(next);
			});
		return () => {
			cancelled = true;
		};
	// `schema` itself is deliberately not a dependency: it is refetched on every etag check, and
	// the only parts that matter here are its name and the edges named by the columns, both of
	// which are listed.
	}, [commandBus, schema, schemaName, edgeKey]);

	return packs;
}
