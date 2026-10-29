import React from 'react';

import { getFieldSchema, localizeLangJson } from './cells/cellValues';
import { schemaModuleName, useI18n, useTranslate } from '../../i18n';

import type * as dyn from '@nikkierp/common/dynamicModel';


/** The schema declaring `field`: the table's own, or the one a dotted field's edge points at. */
export function fieldOwnerSchemaName(
	modelSchema: dyn.ModelSchema | undefined,
	field: string,
): string | undefined {
	const dot = field.indexOf('.');
	if (dot < 0) {
		return modelSchema?.name;
	}
	const edgeName = field.slice(0, dot);
	const relations = [...(modelSchema?.to_relations ?? []), ...(modelSchema?.from_relations ?? [])];
	return relations.find(relation => relation.edge === edgeName)?.dest_schema_name;
}

/** The translation namespaces of every schema whose labels or record labels the table shows. */
export function schemaNamespaces(
	modelSchema: dyn.ModelSchema | undefined,
	relatedSchemas: Record<string, dyn.ModelSchema>,
): string[] {
	const schemaNames = [...(modelSchema ? [modelSchema.name] : []), ...Object.keys(relatedSchemas)];
	const namespaces = schemaNames.map(schemaModuleName).filter((ns): ns is string => Boolean(ns));
	return Array.from(new Set(namespaces));
}

/**
 * A column's schema label, its `$ref` resolved against the module owning the field (a dotted
 * field's edge schema may belong to another module). Falls back to the field name while the
 * schema is unknown or the field has no label.
 */
export function translateSchemaFieldName(
	field: string,
	modelSchema: dyn.ModelSchema | undefined,
	relatedSchemas: Record<string, dyn.ModelSchema>,
	language: string | undefined,
	translateRef: (key: string, schemaName: string) => string | undefined,
): string {
	const ownerName = fieldOwnerSchemaName(modelSchema, field);
	const label = getFieldSchema(modelSchema, field, relatedSchemas)?.label;
	if (!ownerName || !label) {
		return field;
	}
	return localizeLangJson(label, language, key => translateRef(key, ownerName)) || field;
}

/**
 * A column's schema description, resolved like `translateSchemaFieldName`, or '' when the field
 * has none or its `$ref` has no translation.
 */
export function translateFieldDescription(
	field: string,
	modelSchema: dyn.ModelSchema | undefined,
	relatedSchemas: Record<string, dyn.ModelSchema>,
	language: string | undefined,
	translateRef: (key: string, schemaName: string) => string | undefined,
): string {
	const ownerName = fieldOwnerSchemaName(modelSchema, field);
	const description = getFieldSchema(modelSchema, field, relatedSchemas)?.description;
	if (!ownerName || !description) {
		return '';
	}
	return (localizeLangJson(description, language, key => translateRef(key, ownerName)) ?? '').trim();
}

/**
 * The Provider's default `translateFieldName`. It also asks i18next for the namespaces of the
 * related schemas, which `resolveEdgeLabel` reads `$ref` record labels from, and re-renders the
 * table when they arrive.
 */
export function useSchemaFieldNameTranslator(
	modelSchema: dyn.ModelSchema | undefined,
	relatedSchemas: Record<string, dyn.ModelSchema>,
): (field: string) => string {
	return useSchemaFieldTextTranslator(modelSchema, relatedSchemas, translateSchemaFieldName);
}

/** A translator of column descriptions (`translateFieldDescription`) for header tooltips. */
export function useSchemaFieldDescriptionTranslator(
	modelSchema: dyn.ModelSchema | undefined,
	relatedSchemas: Record<string, dyn.ModelSchema>,
): (field: string) => string {
	return useSchemaFieldTextTranslator(modelSchema, relatedSchemas, translateFieldDescription);
}

function useSchemaFieldTextTranslator(
	modelSchema: dyn.ModelSchema | undefined,
	relatedSchemas: Record<string, dyn.ModelSchema>,
	translateText: typeof translateSchemaFieldName,
): (field: string) => string {
	const namespaces = React.useMemo(
		() => schemaNamespaces(modelSchema, relatedSchemas), [modelSchema, relatedSchemas],
	);
	const t = useTranslate(namespaces.length > 0 ? namespaces : undefined);
	const i18n = useI18n();
	const language = i18n.language;
	return React.useCallback((field: string) => translateText(
		field, modelSchema, relatedSchemas, language,
		(key, schemaName) => {
			const ns = schemaModuleName(schemaName);
			return i18n.exists(key, { ns }) ? t(key, { ns }) : undefined;
		},
	), [i18n, language, modelSchema, relatedSchemas, t, translateText]);
}
