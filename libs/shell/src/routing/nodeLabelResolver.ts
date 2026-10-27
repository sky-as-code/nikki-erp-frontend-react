import { CommandBus } from '@nikkierp/common/commandBus';
import * as dyn from '@nikkierp/common/dynamicModel';
import { capitalizeWords } from '@nikkierp/common/utils';
import { resolveLangJson } from '@nikkierp/ui/components';
import i18n, { schemaModuleName } from '@nikkierp/ui/i18n';

import type { ICommandBus } from '@nikkierp/common/commandBus';
import type { NodeLabelResolver } from '@nikkierp/ui/breadcrumbs';


export type NodeLabelResolverDeps = {
	bus: () => ICommandBus | null,
	translate: (key: string, ns: string | undefined, count?: number) => string,
	language: () => string | undefined,
};

/** `{module}_{entity}`, the shape every schema name has; anything else in a path is a plain route word. */
const SCHEMA_SEGMENT = /^[a-z][a-z0-9]*_[a-z0-9_]+$/;

/**
 * Names a breadcrumb node the user has not visited this session, from the schema the path names:
 * `…/{schema}/{id}` → the record's `record_label_field`, `…/{schema}` → the schema's plural label, capitalised.
 * `undefined` for a path naming no schema, so the trail falls back to the humanised route segment.
 */
export function createNodeLabelResolver(deps: NodeLabelResolverDeps): NodeLabelResolver {
	return async (path) => {
		const bus = deps.bus();
		const segments = path.split('/').filter(Boolean);
		const schemaIndex = findLastIndex(segments, segment => SCHEMA_SEGMENT.test(segment));
		if (!bus || schemaIndex < 0) {
			return undefined;
		}
		const schemaName = segments[schemaIndex];
		const pack = await dyn.publishGetSchema(bus, schemaName);
		if (!pack) {
			return undefined;
		}
		const id = segments[schemaIndex + 1];
		if (!id || id === 'new') {
			// A list: capitalised like its table title and the tab title the list page sets.
			const plural = localizeLabel(pack.modelSchema.label, schemaModuleName(schemaName), deps, 99);
			return plural && capitalizeWords(plural);
		}
		return readRecordLabel(bus, schemaName, id, pack.modelSchema.record_label_field ?? 'id', deps);
	};
}

async function readRecordLabel(
	bus: ICommandBus, schemaName: string, id: string, labelField: string, deps: NodeLabelResolverDeps,
): Promise<string | undefined> {
	const response = await bus.publish<dyn.RestGetOneResponse<Record<string, unknown>>>({
		name: dyn.resourceCommand(schemaName, 'get_by_id'),
		payload: { id, fields: [labelField] },
	});
	const value = response.error ? undefined : response.data?.item?.[labelField];
	if (typeof value === 'string' || typeof value === 'number') {
		return String(value) || undefined;
	}
	if (value && typeof value === 'object') {
		return localizeLabel(value as dyn.ModelSchemaLangJson, schemaModuleName(schemaName), deps) || undefined;
	}
	return undefined;
}

function localizeLabel(
	langJson: dyn.ModelSchemaLangJson | undefined, ns: string | undefined, deps: NodeLabelResolverDeps, count?: number,
): string | undefined {
	return resolveLangJson(langJson, deps.language(), key => deps.translate(key, ns, count)) || undefined;
}

function findLastIndex<T>(items: T[], predicate: (item: T) => boolean): number {
	for (let i = items.length - 1; i >= 0; i--) {
		if (predicate(items[i])) {
			return i;
		}
	}
	return -1;
}

export const shellNodeLabelResolver: NodeLabelResolver = createNodeLabelResolver({
	bus: () => CommandBus.instance ?? null,
	translate: (key, ns, count) => i18n.t(key, { ns, count }),
	language: () => i18n.language,
});
