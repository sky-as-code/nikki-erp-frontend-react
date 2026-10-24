import React from 'react';

import { copyRowsToClipboard, rowsFromSelection } from './clipboard';
import { useExcelDataTableContext } from './context';
import { SORT_HANDLE_ATTRIBUTE } from './manualSort/ManualSort';


/**
 * Keys on the focused table body: arrows move a single selection (a multi-selection collapses
 * to its last row first), Enter with exactly one selected row starts inline editing (when rows are
 * updatable and not locked), Ctrl/Cmd+C
 * copies the selected rows as TSV and HTML. Nothing here runs while a row is being edited or
 * inserted; that row owns its own keys. Nor for a key typed into an input — a table-scope row is all
 * inputs, and its arrows and Ctrl+C belong to the text being edited — or on a sort handle.
 */
export function useTableKeyboard() {
	const { selection, editing, canUpdateRows, data } = useExcelDataTableContext();
	return React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
		if (editing.isActive || isInputTarget(event.target)) {
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
		if (event.key === 'Enter' && canUpdateRows && selection.ids.length === 1) {
			event.preventDefault();
			editing.start(selection.ids[0]);
		}
	}, [data, editing, selection, canUpdateRows]);
}

/** Keys the target keeps: typing in an input, or driving a row drag from its handle. */
function isInputTarget(target: EventTarget | null): boolean {
	const element = target as HTMLElement | null;
	const tag = element?.tagName?.toLowerCase();
	if (tag === 'input' || tag === 'textarea' || tag === 'select' || element?.isContentEditable === true) {
		return true;
	}
	return element?.closest?.(`[${SORT_HANDLE_ATTRIBUTE}]`) != null;
}
