import { ExcelDataTable } from '@nikkierp/ui/components/ExcelDataTable';
import { useTranslate } from '@nikkierp/ui/i18n';
import { ComponentAnchor } from '@nikkierp/viewengine/render';
import React from 'react';

import classes from './ExcelDataTableBody.module.css';
import { excelDataTableBodyPropsSchema, ExcelDataTableBodyProps } from './props';
import { EXCEL_DATA_TABLE_BODY } from '../../ids';

import type { IComponentRenderer } from '@nikkierp/viewengine/core';


export const excelDataTableBodyRenderer: IComponentRenderer<ExcelDataTableBodyProps> = {
	type: EXCEL_DATA_TABLE_BODY,
	propsSchema: excelDataTableBodyPropsSchema,
	render(props) {
		return (
			<ComponentAnchor id={EXCEL_DATA_TABLE_BODY}>
				<ExcelDataTableBody {...props} />
			</ComponentAnchor>
		);
	},
};

/**
 * The enclosing table's rows.
 *
 * `useContext` throws outside an `ExcelDataTable.Provider`, which is the right failure: this node
 * has no data of its own, so a page that places it anywhere else is misconfigured rather than
 * merely empty.
 */
function ExcelDataTableBody({ emptyText }: ExcelDataTableBodyProps): React.ReactNode {
	const { translationNs } = ExcelDataTable.useContext();
	const t = useTranslate(translationNs);
	// Left undefined when the page names no key, so `Table` falls back to its own generic
	// "no results" line rather than rendering an empty string.
	return <ExcelDataTable.Table className={classes.body} emptyText={emptyText ? t(emptyText) : undefined} />;
}
