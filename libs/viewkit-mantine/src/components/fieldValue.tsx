import * as dyn from '@nikkierp/common/dynamicModel';
import { LocalizedDateTime, LocalizedNumber } from '@nikkierp/ui/components';
import { getDecimalScale, toLangJson } from '@nikkierp/ui/components/ExcelDataTable';
import { JsonLangText } from '@nikkierp/ui/i18n';
import React from 'react';

import type { LocalizeFn } from '@nikkierp/ui/i18n';
import type { IFieldRenderer } from '@nikkierp/viewengine/core';


const NUMBER_TYPES: ReadonlySet<dyn.ModelSchemaFieldDataTypeName> = new Set(['int32', 'int64', 'decimal']);
const DATE_TIME_KINDS = { nikkiDate: 'date', nikkiTime: 'time', nikkiDateTime: 'datetime' } as const;

/**
 * Read-mode rendering of a dynamic-model field value.
 *
 * Lives here rather than next to the resource form because the page header renders the same
 * values outside any form context, and a `nikkiLangJson` field must not degrade to
 * `[object Object]` just because of where it is displayed. Numbers, dates and times go through
 * the `Localized*` components so read mode and the data table format them the same way; a
 * page-declared renderer (e.g. the `money` spec) wins over the data-type default.
 */
export function renderDisplayFieldValue(
	fieldValue: unknown,
	fieldSchema?: dyn.ModelSchemaField,
	localize?: LocalizeFn,
	fieldRenderer?: IFieldRenderer,
): React.ReactNode {
	const isUnset = fieldValue === null || fieldValue === undefined || fieldValue === '';
	if (fieldRenderer && !isUnset) {
		const text = formatFieldValue(fieldValue);
		return fieldRenderer.renderRaw ? fieldRenderer.renderRaw(fieldValue, text) : fieldRenderer.render(text, text);
	}
	const typeName = getFieldDataTypeName(fieldSchema);
	if (typeName === 'nikkiLangJson') {
		return <JsonLangText langJson={toLangJson(fieldValue)} />;
	}
	if (localize && typeName === 'enumString' && typeof fieldValue === 'string' && fieldValue !== '') {
		return renderEnumValue(fieldValue, fieldSchema!, localize);
	}
	if (isUnset) {
		return formatFieldValue(fieldValue);
	}
	if (typeName && NUMBER_TYPES.has(typeName)) {
		return <LocalizedNumber value={String(fieldValue)} fractionDigits={getDecimalScale(fieldSchema)} />;
	}
	if (typeName && typeName in DATE_TIME_KINDS) {
		const kind = DATE_TIME_KINDS[typeName as keyof typeof DATE_TIME_KINDS];
		return <LocalizedDateTime value={String(fieldValue)} kind={kind} />;
	}
	return formatFieldValue(fieldValue);
}

/**
 * An enum stores a machine value (`country`); the label for it lives under `{field}.{value}`,
 * the same key the edit form's select builds. i18next runs with `appendNamespaceToMissingKey`
 * and no `fallbackLng`, so an untranslated enum comes back as `module:field.value`; showing the
 * stored value is then the lesser evil.
 */
function renderEnumValue(fieldValue: string, fieldSchema: dyn.ModelSchemaField, localize: LocalizeFn): string {
	const key = `${fieldSchema.name}.${fieldValue}`;
	const label = localize(dyn.newLangJsonRef(key));
	return label && !label.endsWith(key) ? label : formatFieldValue(fieldValue);
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
