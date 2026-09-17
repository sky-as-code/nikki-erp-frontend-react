import { Title as MantineTitle } from '@mantine/core';
import clsx from 'clsx';
import React from 'react';

import { useExcelDataTableContext } from './context';
import classes from './ExcelDataTable.module.css';

import type { ExcelDataTableContextValue } from './context';


export type TitleProps = {
	/** A fixed title. */
	value?: string,
	/**
	 * The resource name for the current row count, e.g. `ctx => lc(schema.label, { count: … })`.
	 * Wins over `value`. Pluralization belongs here because only the caller knows the translation
	 * key; the count itself is appended by this component.
	 */
	render?: (context: ExcelDataTableContextValue) => string,
	/**
	 * Appends the total as `Name (10)`, matching the v1 table. Turn it off for a table whose
	 * heading is not a row count — an embedded one whose total is already shown elsewhere.
	 */
	showTotal?: boolean,
};

/**
 * `Name (total)`, matching the v1 table's heading.
 *
 * The name arrives already pluralized — only the caller holds the translation key, so it passes the
 * row count through i18next's own `count` option and hands the result here. This appends the number
 * the reader actually wants to see beside it.
 */
export function titleText(name: string, total: number | undefined, showTotal: boolean): string {
	return showTotal ? `${name} (${total ?? 0})` : name;
}

export function Title({ value, render, showTotal = true }: TitleProps) {
	const context = useExcelDataTableContext();
	const name = render ? render(context) : (value ?? '');
	const text = titleText(name, context.data.total, showTotal);
	return (
		<MantineTitle order={3} className={clsx('capitalize', classes.title)} title={text} {...context.tid.title()}>
			{text}
		</MantineTitle>
	);
}
