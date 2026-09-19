import React from 'react';

import { copyRowsToClipboard, rowsFromSelection } from './clipboard';
import { useExcelDataTableContext } from './context';


/**
 * Keys on the focused table body: arrows move a single selection (a multi-selection collapses
 * to its last row first), Enter with exactly one selected row starts inline editing, Ctrl/Cmd+C
 * copies the selected rows as TSV and HTML. Nothing here runs while a row is being edited; the
 * editing row owns its own keys.
 */
export function useTableKeyboard() {
	const { selection, editing, updateCommand, data } = useExcelDataTableContext();
	return React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
		if (editing.rowId !== null) {
			return;
		}
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
			event.preventDefault();
			void copyRowsToClipboard(rowsFromSelection(data, selection.order, selection.ids));
			return;
		}
		if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			event.preventDefault();
			selection.move(event.key === 'ArrowUp' ? -1 : 1);
			return;
		}
		if (event.key === 'Enter' && updateCommand && selection.ids.length === 1) {
			event.preventDefault();
			editing.start(selection.ids[0]);
		}
	}, [data, editing, selection, updateCommand]);
}
