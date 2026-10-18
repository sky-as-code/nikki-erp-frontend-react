import React from 'react';

import {
	getCellText, getCellValue, getFieldSchema, renderDataCellContent, resolveEdgeLabel,
} from './cellValues';
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
};

/** What a cell shows for one field of a row: its edge label, renderer output or text. */
export function useCellDisplay(item: SearchItem, field: string): CellDisplay {
	const { modelSchema, relatedSchemas, fieldRenderers, data, translationNs } = useExcelDataTableContext();
	const t = useTranslate(translationNs);
	const { language } = useI18n();
	const fieldSchema = getFieldSchema(modelSchema, field, relatedSchemas);
	const renderer = fieldRenderers[field];
	const edgeLabel = resolveEdgeLabel(item, field, modelSchema, relatedSchemas, language);
	const rawValue = edgeLabel ?? getCellValue(item, field);
	const text = edgeLabel ?? getCellText(item, field, data.masked_fields);
	const content = React.useMemo(
		() => (edgeLabel !== undefined && !renderer
			? edgeLabel
			: renderDataCellContent(rawValue, text, fieldSchema, renderer, t, item)),
		[edgeLabel, fieldSchema, item, rawValue, renderer, t, text],
	);
	return { content, text, fieldSchema, renderer };
}

/** A read-only cell's content, for rows that render cells of their own (the row editor). */
export function CellContent({ item, field }: { item: SearchItem, field: string }): React.ReactNode {
	return useCellDisplay(item, field).content;
}
