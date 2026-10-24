import { useExcelDataTableContext } from './context';

import type { RowId } from './types';
import type React from 'react';


/** A modified click or non-primary button means "open in new tab/window": never intercept those. */
export function isModifiedClick(event: React.MouseEvent): boolean {
	return event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0;
}

/** Data, action and filler cells: a plain primary press selects that row alone; anything else is the browser's. */
export function useSelectOnlyPress(rowId: RowId): (event: React.MouseEvent) => void {
	const { selection } = useExcelDataTableContext();
	return (event: React.MouseEvent) => {
		if (!isModifiedClick(event)) {
			selection.selectRow(rowId);
		}
	};
}
