import clsx from 'clsx';
import React from 'react';

import { useExcelDataTableContext } from './context';
import classes from './ExcelDataTable.module.css';
import { useMeasuredWidth } from './useIsCompact';


export type ToolbarProps = {
	left?: React.ReactNode,
	right?: React.ReactNode,
	className?: string,
};

/**
 * A row with `left` and `right` spaced apart.
 *
 * It measures itself and publishes its width, which is what drives the compact switch: the table
 * has to adapt to the space it actually occupies, not to the size of the window. A list pane in a
 * split view is the case that makes the difference — narrower than a phone on a wide screen.
 */
export function Toolbar({ left, right, className }: ToolbarProps) {
	const { setContainerWidth } = useExcelDataTableContext();
	const measureRef = useMeasuredWidth(setContainerWidth);
	return (
		<div ref={measureRef} className={clsx(classes.toolbar, className)}>
			<div className={clsx(classes.toolbarSide, classes.toolbarLeft)}>{left}</div>
			<div className={clsx(classes.toolbarSide, classes.toolbarRight)}>{right}</div>
		</div>
	);
}
