import React from 'react';

import { useExcelDataTableContext } from './context';

import type { ExcelViewMode } from './types';


export type ForViewModeProps = {
	view: ExcelViewMode,
	children?: React.ReactNode,
};

/** Renders its children only while `view` is the current view mode. */
export function ForViewMode({ view, children }: ForViewModeProps) {
	const { viewMode } = useExcelDataTableContext();
	return viewMode === view ? <>{children}</> : null;
}
