import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';

import { applyCustomRenderer, findDefaultRenderer, renderDefaultByDataType, renderEnumBadge } from './cellRenderers';
import i18next, { schemaModuleName } from '../../../i18n';
import { resolveLangJson } from '../../translatable/langJson';
import { ENUM_DATA_TYPES, getFieldSchema } from '../filter/filterModel';

import type { CellAlignment } from './cellRenderers';
import type { TranslateFn } from '../../../i18n';
import type { SearchItem } from '../types';
import type { IFieldRenderer } from '@nikkierp/viewengine/core';


export function getCellText(item: SearchItem, field: string, maskedFields: string[]): string {
	if (maskedFields.includes(field)) {
		return '********';
	}
	return String(getCellValue(item, field) ?? '');
}

/**
 * The value of a field, which may reach one edge deep (`product_template.name`).
 *
 * The server nests a selected edge field under the edge name rather than flattening it into the
 * row, so a dotted name is a path to walk and never a key on the record itself.
 */
export function getCellValue(item: SearchItem | undefined, field: string): unknown {
	if (!item) {
		return undefined;
	}
	if (!field.includes('.')) {
		return item[field];
	}
	let current: unknown = item;
	for (const segment of field.split('.')) {
		if (current == null || typeof current !== 'object') {
			return undefined;
		}
		current = (current as Record<string, unknown>)[segment];
	}
	return current;
}

export { getFieldSchema };

export function isArrayField(fieldSchema?: dyn.ModelSchemaField): boolean {
	if (!fieldSchema || typeof fieldSchema.data_type === 'string') {
		return false;
	}
	return fieldSchema.data_type.is_array === true;
}

export function getFieldDataTypeName(
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

/**
 * The label of the record an edge-id column points at, when the row carries the edge object.
 *
 * A foreign-key column (`product_template_id`) shows its target's `record_label_field` rather
 * than the id, provided the search selected `product_template.{label}`. The resource list, its
 * related-record tabs and the detail page select it for every to-one edge (`withEdgeLabels` on
 * `useResourceSearch`, `useEdgeLabelFields`); without it, the id itself is all there is to show.
 */
export function resolveEdgeLabel(
	item: SearchItem | undefined,
	field: string,
	modelSchema: dyn.ModelSchema | undefined,
	relatedSchemas: Record<string, dyn.ModelSchema>,
	language?: string,
	translateRef: SchemaRefTranslator = translateSchemaRef,
): string | undefined {
	const relation = modelSchema?.to_relations?.find(rel => rel.src_field === field);
	if (!relation) {
		return undefined;
	}
	const labelField = relatedSchemas[relation.dest_schema_name]?.record_label_field;
	if (!labelField) {
		return undefined;
	}
	const label = getCellValue(item, `${relation.edge}.${labelField}`);
	if (label == null) {
		return undefined;
	}
	if (typeof label !== 'object') {
		return String(label);
	}
	const destSchemaName = relation.dest_schema_name;
	return localizeLangJson(label as dyn.ModelSchemaLangJson, language, key => translateRef(key, destSchemaName));
}

/** Translates a `$ref` key owned by `schemaName`'s module; undefined when it has no translation (yet). */
export type SchemaRefTranslator = (key: string, schemaName: string) => string | undefined;

/**
 * Reads the shared i18next store rather than a hook, so it can run per cell. The namespace must
 * already be loaded: the Provider's default `translateFieldName` loads those of every schema the
 * table shows, and re-renders the table once they arrive.
 */
export function translateSchemaRef(key: string, schemaName: string): string | undefined {
	const ns = schemaModuleName(schemaName);
	return i18next.exists(key, { ns }) ? i18next.t(key, { ns }) : undefined;
}

/**
 * A lang-json value (`essential_uom.name`, a field label) as text, by {@link resolveLangJson};
 * undefined when it has none, so a caller can fall back to the record id or field name.
 */
export function localizeLangJson(
	langJson: dyn.ModelSchemaLangJson,
	language: string | undefined,
	translateRef?: (key: string) => string | undefined,
): string | undefined {
	return resolveLangJson(langJson, language, translateRef) || undefined;
}

export function getCellAlignment(
	fieldSchema: dyn.ModelSchemaField | undefined,
	fieldRenderer: IFieldRenderer | undefined,
): CellAlignment {
	if (fieldRenderer) {
		return (fieldRenderer as { align?: CellAlignment }).align ?? 'left';
	}
	return findDefaultRenderer(getFieldDataTypeName(fieldSchema))?.align ?? 'left';
}

export function renderDataCellContent(
	rawValue: unknown,
	textValue: string,
	fieldSchema: dyn.ModelSchemaField | undefined,
	fieldRenderer: IFieldRenderer | undefined,
	t: TranslateFn,
	record?: SearchItem,
): React.ReactNode {
	if (fieldRenderer) {
		return applyCustomRenderer(fieldRenderer, textValue, t, rawValue, record);
	}
	if (!isArrayField(fieldSchema)) {
		return renderDefaultValue(rawValue, textValue, fieldSchema, t);
	}
	const values = Array.isArray(rawValue) ? rawValue : (rawValue == null || rawValue === '' ? [] : [rawValue]);
	if (values.length === 0) {
		return '';
	}
	return values.map((value, index) => (
		<React.Fragment key={`${String(value)}-${index}`}>
			{renderDefaultValue(value, String(value ?? ''), fieldSchema, t)}
			{index < values.length - 1 ? <br /> : null}
		</React.Fragment>
	));
}

/** An enum needs `t` for its label, which the data-type renderers do not get, so it is routed here. */
function renderDefaultValue(
	rawValue: unknown,
	textValue: string,
	fieldSchema: dyn.ModelSchemaField | undefined,
	t: TranslateFn,
): React.ReactNode {
	const dataTypeName = getFieldDataTypeName(fieldSchema);
	if (fieldSchema && dataTypeName && ENUM_DATA_TYPES.has(dataTypeName)) {
		return renderEnumBadge(textValue, fieldSchema.name, t);
	}
	return renderDefaultByDataType(rawValue, textValue, dataTypeName, fieldSchema);
}

/** A value with no whitespace cannot wrap, so it is clipped rather than allowed to overflow. */
export function shouldUseSingleLineEllipsis(value: string): boolean {
	const normalized = value.trim();
	return normalized.length > 0 && !/\s/.test(normalized);
}

export function getRowNumber(page: number, size: number, rowIndex: number): number {
	return (page * size) + rowIndex + 1;
}
