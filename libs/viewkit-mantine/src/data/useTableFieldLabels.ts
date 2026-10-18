import { useLocalize, useTranslate } from '@nikkierp/ui/i18n';
import React from 'react';

import { resolveSchemaField } from './fieldPaths';
import { useRelatedSchemas } from './useRelatedSchemas';

import type * as dyn from '@nikkierp/common/dynamicModel';


/**
 * The schemas a table reads related fields from: the destinations of the dotted columns the
 * search returned (from `default_search_fields` or the user's saved columns), plus those of every
 * foreign key whose label the search selected.
 */
export function useTableRelatedSchemas(
	schema: dyn.ModelSchema | undefined,
	desiredFields: string[] | undefined,
	edgeLabelSchemas: Record<string, dyn.ModelSchema>,
): Record<string, dyn.ModelSchema> {
	const dottedSchemas = useRelatedSchemas(schema, desiredFields);
	return React.useMemo(() => ({ ...edgeLabelSchemas, ...dottedSchemas }), [edgeLabelSchemas, dottedSchemas]);
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
