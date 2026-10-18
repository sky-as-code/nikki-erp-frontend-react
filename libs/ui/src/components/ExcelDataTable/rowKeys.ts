import type React from 'react';


export type RowKeyInput = {
	key: string,
	defaultPrevented: boolean,
	/** False for a key from a dropdown portalled out of the row, which still bubbles through React. */
	insideRow: boolean,
	isTextarea: boolean,
	/** An input whose dropdown is open: its Enter picks an option. */
	isPopupOpen: boolean,
};

export type RowKeyIntent = 'confirm' | 'discard' | null;

/**
 * What a key pressed in an editing or inserting row asks for. Enter in any of the row's inputs
 * confirms, except where Enter already means something: a new line in a textarea, an option in an
 * open dropdown, or a key a field consumed itself.
 */
export function rowKeyIntent(input: RowKeyInput): RowKeyIntent {
	if (input.defaultPrevented || !input.insideRow) {
		return null;
	}
	if (input.key === 'Escape') {
		return 'discard';
	}
	if (input.key === 'Enter' && !input.isTextarea && !input.isPopupOpen) {
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
		isPopupOpen: target.getAttribute?.('aria-expanded') === 'true',
	});
}
