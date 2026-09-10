import { findRelationBySrcField, LangJsonRefKey } from '@nikkierp/common/dynamicModel';

import type { ModelSchema, ModelSchemaField } from '@nikkierp/common/dynamicModel';


/**
 * The language a field label falls back to before the raw field name. The client has no tenant
 * default language (i18n deliberately declares no `fallbackLng`), so the platform default is the
 * one language every schema label is guaranteed to carry.
 */
export const DEFAULT_LANGUAGE = 'en-US';

/** The field every import must map when the schema declares it (deduplication key). */
export const EXTERNAL_ID_FIELD = 'external_id';

const ORG_ID_FIELD = 'org_id';
const TENANT_ID_FIELD = 'tenant_id';
const ETAG_DATA_TYPE = 'nikkiEtag';

/** One column of the "Target columns" side of the mapping table. */
export type ImportTarget = {
	/** Schema field name; what the mapping payload carries. */
	name: string,
	/** What the row shows: the localized label, suffixed for a reference column. */
	label: string,
	/** The field is the foreign key of a to-relation; its cell holds a label to resolve. */
	isEdge: boolean,
	destSchemaName?: string,
	/** Must have a file column before the import may start. */
	isMandatory: boolean,
	/** Normalized texts a file header may carry to match this field, most specific first. */
	matchKeys: string[],
};

export type TranslateKeyFn = (key: string) => string;

/**
 * Mirrors the backend's `importTargetEligible`: anything the server owns (keys, versioning,
 * tenancy, generated values, derived values) is out; org_id is out because the request resolves
 * it once for every row. Foreign keys stay in — they are the reference columns.
 */
export function isImportTarget(field: ModelSchemaField): boolean {
	if (field.is_auto_generated || field.is_virtual || field.is_edge_model || field.is_primary_key) {
		return false;
	}
	if (field.name === ORG_ID_FIELD || field.name === TENANT_ID_FIELD) {
		return false;
	}
	return dataTypeName(field) !== ETAG_DATA_TYPE;
}

/** `required_for_create` with no default, plus `external_id` wherever the schema declares it. */
export function isMandatoryTarget(field: ModelSchemaField): boolean {
	if (field.name === EXTERNAL_ID_FIELD) {
		return true;
	}
	return Boolean(field.is_required_for_create) && (field.default_value === undefined || field.default_value === null);
}

/**
 * Current language → default language → raw field name. A `$ref` label is a translation key and
 * resolves through the translator instead, with the field name as the last resort.
 */
export function resolveFieldLabel(field: ModelSchemaField, language: string, translate: TranslateKeyFn): string {
	const label = field.label ?? {};
	const ref = label[LangJsonRefKey];
	if (ref) {
		const translated = translate(ref);
		return translated && translated !== ref ? translated : field.name;
	}
	return label[language] || label[DEFAULT_LANGUAGE] || field.name;
}

/** Every text a header may use for this field, in the order the requirement resolves labels. */
export function fieldMatchKeys(field: ModelSchemaField, language: string, translate: TranslateKeyFn): string[] {
	const label = field.label ?? {};
	const ref = label[LangJsonRefKey];
	const candidates = ref
		? [translate(ref), field.name]
		: [label[language], label[DEFAULT_LANGUAGE], field.name];
	const keys: string[] = [];
	for (const candidate of candidates) {
		const key = normalizeMatchKey(candidate);
		if (key && !keys.includes(key)) {
			keys.push(key);
		}
	}
	return keys;
}

/** Case- and whitespace-insensitive, diacritics preserved: how a person reads a spreadsheet. */
export function normalizeMatchKey(text: string | undefined | null): string {
	return (text ?? '').split(/\s+/u).filter(Boolean).join(' ').toLowerCase();
}

export function buildImportTargets(
	schema: ModelSchema, language: string, translate: TranslateKeyFn, referenceSuffix: string,
): ImportTarget[] {
	return Object.values(schema.fields)
		.filter(isImportTarget)
		.map((field) => {
			const relation = findRelationBySrcField(schema, field.name);
			const isEdge = relation !== undefined
				&& (relation.relation_type === 'many:one' || relation.relation_type === 'one:one');
			const baseLabel = resolveFieldLabel(field, language, translate);
			return {
				name: field.name,
				label: isEdge ? `${baseLabel} (${referenceSuffix})` : baseLabel,
				isEdge,
				destSchemaName: isEdge ? relation.dest_schema_name : undefined,
				isMandatory: isMandatoryTarget(field),
				matchKeys: fieldMatchKeys(field, language, translate),
			};
		});
}

function dataTypeName(field: ModelSchemaField): string {
	const dataType = field.data_type as { name?: string } | string | undefined;
	if (typeof dataType === 'string') {
		return dataType;
	}
	return dataType?.name ?? '';
}
