import React from 'react';

import { useExcelDataTableContext } from './context';
import { tableScopeAttrs } from './tableScope';

import type { ExcelViewMode } from './types';


export type ForViewModeProps = {
	view: ExcelViewMode,
	children?: React.ReactNode,
};

/**
 * Renders its children only while `view` is the current view mode. The wrapper takes no layout
 * (`display: contents`); it marks a page-built view (cards, kanban) as part of the table, so a
 * click there is not taken for leaving it.
 */
export function ForViewMode({ view, children }: ForViewModeProps) {
	const { viewMode, scopeId } = useExcelDataTableContext();
	return viewMode === view ? <div className='contents' {...tableScopeAttrs(scopeId)}>{children}</div> : null;
}
