import React from 'react';

import type { SelectionApi } from './context';


/** Marks every element that belongs to one table, so a click or focus there is not "leaving" it. */
export const TABLE_SCOPE_ATTRIBUTE = 'data-edt-scope';

/** Mantine renders menus, dropdowns, popovers and modals into a portal node carrying this attribute. */
const PORTAL_SELECTOR = '[data-portal]';

type Closest = { closest: (selector: string) => unknown };

export function tableScopeAttrs(scopeId: string): Record<string, string> {
	return { [TABLE_SCOPE_ATTRIBUTE]: scopeId };
}

/**
 * True when an event target is part of the table: one of its own elements, or a portal — the
 * dropdowns and menus the table opens live there, outside its DOM. A target that is not an element
 * (the window, the document) counts as inside: nothing was clicked away to.
 */
export function isInsideTableScope(target: unknown, scopeId: string): boolean {
	if (typeof (target as Closest | null)?.closest !== 'function') {
		return true;
	}
	const element = target as Closest;
	return element.closest(`[${TABLE_SCOPE_ATTRIBUTE}="${scopeId}"]`) != null
		|| element.closest(PORTAL_SELECTOR) != null;
}

/**
 * Clears the selection when the user clicks or tabs away from the table — the one way to unselect
 * a row. An open row edit or insert row keeps it: its selection is what that row is.
 */
export function useClearSelectionOnLeave(scopeId: string, isEditing: boolean, selection: SelectionApi): void {
	const latest = React.useRef({ isEditing, selection });
	React.useEffect(() => {
		latest.current = { isEditing, selection };
	});
	React.useEffect(() => {
		const onOutside = (event: Event) => {
			const current = latest.current;
			if (current.isEditing || current.selection.ids.length === 0 || isInsideTableScope(event.target, scopeId)) {
				return;
			}
			current.selection.clear();
		};
		document.addEventListener('pointerdown', onOutside, true);
		document.addEventListener('focusin', onOutside, true);
		return () => {
			document.removeEventListener('pointerdown', onOutside, true);
			document.removeEventListener('focusin', onOutside, true);
		};
	}, [scopeId]);
}

/** A table's scope id, with the selection cleared when the user leaves that scope. */
export function useTableScope(isEditing: boolean, selection: SelectionApi): string {
	const scopeId = React.useId();
	useClearSelectionOnLeave(scopeId, isEditing, selection);
	return scopeId;
}
