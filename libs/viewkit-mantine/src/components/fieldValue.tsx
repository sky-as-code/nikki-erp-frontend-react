import * as dyn from '@nikkierp/common/dynamicModel';
import { toLangJson } from '@nikkierp/ui/components/DataTable';
import { JsonLangText } from '@nikkierp/ui/i18n';
import React from 'react';

import type { LocalizeFn } from '@nikkierp/ui/i18n';


/**
 * Read-mode rendering of a dynamic-model field value.
 *
 * Lives here rather than next to the resource form because the page header renders the same
 * values outside any form context, and a `nikkiLangJson` field must not degrade to
 * `[object Object]` just because of where it is displayed.
 */
export function renderDisplayFieldValue(
	fieldValue: unknown,
	fieldSchema?: dyn.ModelSchemaField,
	localize?: LocalizeFn,
): React.ReactNode {
	if (getFieldDataTypeName(fieldSchema) === 'nikkiLangJson') {
		return <JsonLangText langJson={toLangJson(fieldValue)} />;
	}
	// An enum stores a machine value (`country`); the label for it lives under
	// `{field}.{value}`, the same key the edit form's select builds. Without this, read mode
	// shows the raw stored value while edit mode shows the translated one, for the same field.
	if (localize && getFieldDataTypeName(fieldSchema) === 'enumString'
		&& typeof fieldValue === 'string' && fieldValue !== '') {
		const key = `${fieldSchema!.name}.${fieldValue}`;
		const label = localize(dyn.newLangJsonRef(key));
		// i18next runs with `appendNamespaceToMissingKey` and no `fallbackLng`, so an untranslated
		// enum comes back as `module:field.value`. Showing the stored value is the lesser evil.
		return label && !label.endsWith(key) ? label : formatFieldValue(fieldValue);
	}
	return formatFieldValue(fieldValue);
}

export function formatFieldValue(fieldValue: unknown): string {
	if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
		return '-';
	}
	if (typeof fieldValue === 'string' || typeof fieldValue === 'number' || typeof fieldValue === 'boolean') {
		return String(fieldValue);
	}
	try {
		return JSON.stringify(fieldValue);
	}
	catch {
		return String(fieldValue);
	}
}

function getFieldDataTypeName(
	fieldSchema?: dyn.ModelSchemaField,
): dyn.ModelSchemaFieldDataTypeName | null {
	if (!fieldSchema) {
		return null;
	}
	if (typeof fieldSchema.data_type === 'string') {
		return fieldSchema.data_type;
	}
	return fieldSchema.data_type.name;
}
