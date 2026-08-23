import * as dyn from '@nikkierp/common/dynamicModel';
import React from 'react';

import { applyCustomRenderer, renderDefaultByDataType } from './cellRenderers';

import type { SearchItem } from './types';
import type { TranslateFn } from '../../i18n';
import type { IFieldRenderer } from '@nikkierp/viewengine/core';


/**
 * Turning a record's field into text and into rendered content.
 *
 * Both live here rather than beside the table cell because the grid's cards need exactly the
 * same answers: the same masking, the same data-type renderers, the same array handling. A card
 * that formatted a date differently from the row it replaces would make the view switch look
 * like a data change.
 */
export function getCellText(item: SearchItem, field: string, maskedFields: string[]): string {
	if (maskedFields.includes(field)) {
		return '********';
	}
	return String(item[field] ?? '');
}

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

export function renderDataCellContent(
	rawValue: unknown,
	textValue: string,
	fieldSchema: dyn.ModelSchemaField | undefined,
	fieldRenderer: IFieldRenderer | undefined,
	t: TranslateFn,
): React.ReactNode {
	if (fieldRenderer) {
		return applyCustomRenderer(fieldRenderer, textValue, t);
	}
	const dataTypeName = getFieldDataTypeName(fieldSchema);
	if (!isArrayField(fieldSchema)) {
		return renderDefaultByDataType(rawValue, textValue, dataTypeName);
	}
	const values = Array.isArray(rawValue) ? rawValue : (rawValue == null || rawValue === '' ? [] : [rawValue]);
	if (values.length === 0) {
		return '';
	}
	return values.map((value, index) => (
		<React.Fragment key={`${String(value)}-${index}`}>
			{renderDefaultByDataType(value, String(value ?? ''), dataTypeName)}
			{index < values.length - 1 ? <br /> : null}
		</React.Fragment>
	));
}

/** A value with no whitespace cannot wrap, so it is clipped rather than allowed to overflow. */
export function shouldUseSingleLineEllipsis(value: string): boolean {
	const normalized = value.trim();
	return normalized.length > 0 && !/\s/.test(normalized);
}

export function getRowNumber(page: number, size: number, rowIndex: number): number {
	return (page * size) + rowIndex + 1;
}
