import { isRibbonDropdown, RibbonItem, RibbonTab } from '@nikkierp/ui/menu';

import { isPathActiveWithPrefix } from '../helper';


/** Rows a block stacks before it starts the next column, as the Word ribbon does. */
export const RIBBON_ROWS_PER_COLUMN = 3;

export type RibbonLayout = 'full' | 'collapsed';

/** Splits a block's items into columns of at most `rowsPerColumn`, keeping their order. */
export function groupRibbonColumns<T>(items: readonly T[], rowsPerColumn = RIBBON_ROWS_PER_COLUMN): T[][] {
	const columns: T[][] = [];
	for (let i = 0; i < items.length; i += rowsPerColumn) {
		columns.push(items.slice(i, i + rowsPerColumn));
	}
	return columns;
}

/** Blocks collapse into dropdown buttons as soon as their natural row no longer fits. */
export function pickRibbonLayout(naturalWidth: number, available: number): RibbonLayout {
	return naturalWidth <= available ? 'full' : 'collapsed';
}

export function isRibbonItemActive(item: RibbonItem, currentPath: string, pathPrefix: string): boolean {
	if (isRibbonDropdown(item)) {
		return item.items.some(link => isPathActiveWithPrefix(link.link, currentPath, pathPrefix));
	}
	return isPathActiveWithPrefix(item.link, currentPath, pathPrefix);
}

/** The tab holding the current route, or -1 when none does. */
export function findActiveRibbonTab(tabs: readonly RibbonTab[], currentPath: string, pathPrefix: string): number {
	return tabs.findIndex(tab => tab.blocks.some(block => (
		block.items.some(item => isRibbonItemActive(item, currentPath, pathPrefix))
	)));
}
