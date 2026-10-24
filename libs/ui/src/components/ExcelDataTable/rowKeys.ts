import type React from 'react';


export type RowKeyInput = {
	key: string,
	defaultPrevented: boolean,
	/** False for a key from a dropdown portalled out of the row, which still bubbles through React. */
	insideRow: boolean,
	isTextarea: boolean,
	/** An input whose dropdown is open. */
	isPopupOpen: boolean,
	/** An option of that open dropdown is highlighted: Enter picks it, so the row leaves it alone. */
	isOptionHighlighted: boolean,
};

export type RowKeyIntent = 'confirm' | 'discard' | null;

/**
 * What a key pressed in an editing or inserting row asks for. Enter in any of the row's inputs
 * confirms, except where Enter already means something: a new line in a textarea, the highlighted
 * option of an open dropdown, or a key a field consumed itself.
 *
 * An open dropdown with nothing highlighted does not hold Enter back: a `MultiSelect` stays open
 * after a pick, and Enter there has nothing to pick, so it confirms the row.
 */
export function rowKeyIntent(input: RowKeyInput): RowKeyIntent {
	if (input.defaultPrevented || !input.insideRow) {
		return null;
	}
	if (input.key === 'Escape') {
		// An open dropdown closes on Escape; the row must survive that.
		return input.isPopupOpen ? null : 'discard';
	}
	if (input.key === 'Enter' && !input.isTextarea && !(input.isPopupOpen && input.isOptionHighlighted)) {
		return 'confirm';
	}
	return null;
}

export function readRowKey(event: React.KeyboardEvent<HTMLElement>): RowKeyIntent {
	const target = event.target as HTMLElement;
	return rowKeyIntent({
		key: event.key,
		defaultPrevented: event.defaultPrevented,
		insideRow: event.currentTarget.contains(target),
		isTextarea: target instanceof HTMLTextAreaElement,
		isPopupOpen: isPopupOpen(target),
		isOptionHighlighted: isOptionHighlighted(target),
	});
}

/**
 * Whether the input's dropdown is open. Mantine's `data-expanded` is the reliable flag: its
 * `aria-expanded` also needs the option list to have registered, which a custom dropdown or a
 * still-loading one has not, so it can read `false` over an open dropdown.
 */
function isPopupOpen(target: HTMLElement): boolean {
	return target.getAttribute?.('aria-expanded') === 'true' || target.getAttribute?.('data-expanded') === 'true';
}

/**
 * Whether the open dropdown has an option under keyboard focus. Mantine marks it
 * `data-combobox-selected` inside the list the input names in `aria-controls`; that is the option
 * its own Enter handler clicks. A listbox outside Mantine names it in `aria-activedescendant`.
 */
function isOptionHighlighted(target: HTMLElement): boolean {
	const document = target.ownerDocument;
	const listId = target.getAttribute?.('aria-controls');
	const list = listId ? document?.getElementById(listId) : null;
	if (list) {
		return list.querySelector('[data-combobox-selected]') !== null;
	}
	const activeId = target.getAttribute?.('aria-activedescendant');
	return !!activeId && !!document?.getElementById(activeId);
}

/**
 * Enter on a dropdown trigger that has no option to pick: closed, or open with nothing highlighted.
 * Read in the capture phase, because a non-searchable Mantine `Select` consumes Enter on such a
 * trigger (to open itself, or doing nothing while open) before the row's bubble handler sees it. So
 * the row claims the key first, and Enter in any of the row's inputs confirms the row, dropdowns
 * included; a highlighted option still gets its Enter.
 */
export function isPopupEnterForRow(event: React.KeyboardEvent<HTMLElement>): boolean {
	const target = event.target as HTMLElement;
	return event.key === 'Enter'
		&& !event.nativeEvent.isComposing
		&& event.currentTarget.contains(target)
		&& target.getAttribute?.('aria-haspopup') === 'listbox'
		&& !(isPopupOpen(target) && isOptionHighlighted(target));
}
