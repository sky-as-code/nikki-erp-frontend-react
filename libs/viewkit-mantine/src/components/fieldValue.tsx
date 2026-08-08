import * as dyn from '@nikkierp/common/dynamicModel';
import { toLangJson } from '@nikkierp/ui/components/DataTable';
import { JsonLangText } from '@nikkierp/ui/i18n';
import React from 'react';


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
): React.ReactNode {
	if (getFieldDataTypeName(fieldSchema) === 'nikkiLangJson') {
		return <JsonLangText langJson={toLangJson(fieldValue)} />;
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
