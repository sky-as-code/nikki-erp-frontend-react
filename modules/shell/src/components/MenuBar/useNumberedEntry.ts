import { toAriaKeyShortcuts, useSequenceShortcut } from '@nikkierp/ui/shortcuts';
import React from 'react';


/**
 * Joins the bar's sequence, so the shown top-level entries answer `Alt+1` … `Alt+9` in visual
 * order. Entries pushed into the overflow menu unmount from the row and so lose their number.
 */
export function useNumberedEntry<T extends HTMLElement>(): {
	ref: React.RefObject<T | null>,
	'aria-keyshortcuts'?: string,
} {
	const ref = React.useRef<T>(null);
	const spec = useSequenceShortcut(ref, { mode: 'click' });
	return { ref, 'aria-keyshortcuts': toAriaKeyShortcuts(spec) };
}
