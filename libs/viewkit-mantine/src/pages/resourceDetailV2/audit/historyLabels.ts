import { LangJsonRefKey } from '@nikkierp/common/dynamicModel';

import type * as dyn from '@nikkierp/common/dynamicModel';
import type { ResourceHistoryChange } from '@nikkierp/common/service';
import type { LocalizeFn } from '@nikkierp/ui/i18n';


/** The relation a change's field stands for: an edge by name (`roles`), or a foreign key (`uom_id`). */
export function historyRelationOf(
	schema: dyn.ModelSchema | undefined, field: string,
): dyn.ModelSchemaRelation | undefined {
	const relations = [...(schema?.to_relations ?? []), ...(schema?.from_relations ?? [])];
	return relations.find(relation => relation.edge === field)
		?? relations.find(relation => relation.src_field === field);
}

/** The edges a list of changes names, for loading the schemas their labels come from. */
export function historyEdgeNames(schema: dyn.ModelSchema | undefined, changes: ResourceHistoryChange[]): string[] {
	const edges = changes
		.map(change => historyRelationOf(schema, change.field)?.edge)
		.filter((edge): edge is string => Boolean(edge));
	return Array.from(new Set(edges)).sort();
}

function isToMany(relation: dyn.ModelSchemaRelation): boolean {
	return relation.relation_type === 'many:many' || relation.relation_type === 'one:many';
}

/** `{$ref: key}` as `{$ref: ns:key}`, so a label resolves in its own module's namespace from any page. */
export function qualifyLangJson(label: dyn.ModelSchemaLangJson | undefined, ns: string | undefined) {
	const ref = label?.[LangJsonRefKey];
	return ref && ns && !ref.includes(':') ? { ...label, [LangJsonRefKey]: `${ns}:${ref}` } : label;
}

/** A label that came back as its own key: i18next has no fallback language and echoes `ns:key`. */
export function isMissingLabel(text: string, label: dyn.ModelSchemaLangJson | undefined): boolean {
	const ref = label?.[LangJsonRefKey];
	return text === '' || (Boolean(ref) && text.endsWith(ref!.split(':').pop()!));
}

export function capitalizeFirst(text: string): string {
	return text ? text.charAt(0).toLocaleUpperCase() + text.slice(1) : text;
}

export type HistoryFieldLabelInput = {
	field: string,
	schema: dyn.ModelSchema | undefined,
	/** The page's localizer, for the record's own field labels. */
	localize: LocalizeFn,
	/** A localizer with no namespace, for labels already qualified by {@link qualifyLangJson}. */
	localizeAny: LocalizeFn,
	/** The schemas the record's edges point at, by name. */
	relatedSchemas: Record<string, dyn.ModelSchema>,
	/** The namespace of a schema's module. */
	moduleOf: (schemaName: string) => string | undefined,
};

/**
 * The label of a changed field. The schema's own field label first; when it has no translation, as
 * a many-to-many edge (`roles`) usually has not, the label of the resource the edge points at,
 * plural for a to-many edge ("Roles"), singular for a to-one. Else the field name.
 */
export function historyFieldLabel(input: HistoryFieldLabelInput): string {
	const { field, schema, localize, localizeAny, relatedSchemas, moduleOf } = input;
	const ownLabel = schema?.fields[field]?.label;
	const own = ownLabel ? localize(ownLabel) : '';
	if (own && !isMissingLabel(own, ownLabel)) {
		return own;
	}
	const relation = historyRelationOf(schema, field);
	const dest = relation ? relatedSchemas[relation.dest_schema_name] : undefined;
	if (relation && dest?.label) {
		const destLabel = qualifyLangJson(dest.label, moduleOf(dest.name));
		const text = localizeAny(destLabel, { count: isToMany(relation) ? 99 : 1 });
		if (text && !isMissingLabel(text, destLabel)) {
			return capitalizeFirst(text);
		}
	}
	return field;
}

/**
 * An edge value as its records' labels: ids joined with ", ", each its label when the entry carries
 * one (`labels`), else the id itself; `-` for nothing.
 */
export function formatEdgeValue(value: unknown, labels: Record<string, string> | undefined): string {
	const ids = Array.isArray(value) ? value : (value === null || value === undefined || value === '' ? [] : [value]);
	if (ids.length === 0) {
		return '-';
	}
	return ids.map(id => labels?.[String(id)] ?? String(id)).join(', ');
}
