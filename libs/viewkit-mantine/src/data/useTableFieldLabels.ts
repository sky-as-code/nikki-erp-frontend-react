import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import React from 'react';

import { resolveSchemaField } from './fieldPaths';
import { useRelatedSchemas } from './useRelatedSchemas';

import type * as dyn from '@nikkierp/common/dynamicModel';


/**
 * The schemas a table reads related fields from: the destinations of the dotted columns the
 * search returned (from `default_search_fields` or the user's saved columns), read from the
 * registry the schema graph seeded. Edge-id columns need none: the BFF's labelled list names
 * their label field in `edge_labels`.
 */
export function useTableRelatedSchemas(
	schema: dyn.ModelSchema | undefined,
	desiredFields: string[] | undefined,
): Record<string, dyn.ModelSchema> {
	return useRelatedSchemas(schema, desiredFields);
}

/**
 * The schema's own label, or the edge schema's once loaded; a dotted field whose edge schema is
 * still in flight reads as its own path rather than blank.
 */
export function useTranslateFieldName(
	translationNs: string,
	modelSchema: dyn.ModelSchema | undefined,
	relatedSchemas: Record<string, dyn.ModelSchema>,
): (field: string) => string {
	const lc = useLocalize(translationNs);
	const t = useTranslate(translationNs);
	return React.useCallback((field: string) => {
		if (field === 'fields') {
			return t('model_fields');
		}
		const schemaField = modelSchema
			? resolveSchemaField(modelSchema, field, name => relatedSchemas[name])
			: undefined;
		return schemaField ? lc(schemaField.label) : field;
	}, [lc, modelSchema, relatedSchemas, t]);
}
