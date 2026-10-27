import React from 'react';

import {
	getCellText, getCellValue, getFieldSchema, MASKED_TEXT, renderDataCellContent, resolveEdgeLabel,
} from './cellValues';
import { MaskedCellLock } from './MaskedCellLock';
import { maskedFieldMissing } from './maskedFields';
import { useI18n, useTranslate } from '../../../i18n';
import { useExcelDataTableContext } from '../context';

import type { SearchItem } from '../types';
import type * as dyn from '@nikkierp/common/dynamicModel';
import type { IFieldRenderer } from '@nikkierp/viewengine/core';


export type CellDisplay = {
	content: React.ReactNode,
	text: string,
	fieldSchema: dyn.ModelSchemaField | undefined,
	renderer: IFieldRenderer | undefined,
	/** The server masked the value (`masked_fields`): `content` is a lock button, and the cell must not link. */
	locked: boolean,
};

/** What a cell shows for one field of a row: a lock when masked, else its edge label, renderer output or text. */
export function useCellDisplay(item: SearchItem, field: string): CellDisplay {
	const { modelSchema, relatedSchemas, fieldRenderers, data, translationNs } = useExcelDataTableContext();
	const t = useTranslate(translationNs);
	const { language } = useI18n();
	const fieldSchema = getFieldSchema(modelSchema, field, relatedSchemas);
	const renderer = fieldRenderers[field];
	const edgeLabel = resolveEdgeLabel(item, field, modelSchema, data.edge_labels, language);
	const rawValue = edgeLabel ?? getCellValue(item, field);
	const text = edgeLabel ?? getCellText(item, field, data.masked_fields);
	const missing = React.useMemo(
		() => maskedFieldMissing(modelSchema, field, data.masked_fields), [modelSchema, field, data.masked_fields],
	);
	const content = React.useMemo(() => {
		if (missing) {
			return <MaskedCellLock missing={missing} testId={`excelDataTable.maskedCell.${field}`} />;
		}
		return edgeLabel !== undefined && !renderer
			? edgeLabel
			: renderDataCellContent(rawValue, text, fieldSchema, renderer, t, item);
	}, [missing, field, edgeLabel, fieldSchema, item, rawValue, renderer, t, text]);
	return { content, text: missing ? MASKED_TEXT : text, fieldSchema, renderer, locked: missing !== null };
}

/** A read-only cell's content, for rows that render cells of their own (the row editor). */
export function CellContent({ item, field }: { item: SearchItem, field: string }): React.ReactNode {
	return useCellDisplay(item, field).content;
}
