import { capitalizeWords } from '@nikkierp/common/utils';
import React from 'react';


export type UseWindowTitleOptions = {
	/** `false` leaves the tab title alone, e.g. a list pane while the split view shows a record. Default `true`. */
	enabled?: boolean,
	/** Capitalises every word, as the list's table title renders its name with CSS. Default `false`. */
	capitalize?: boolean,
};

/**
 * Sets the browser tab title, nothing else: a utility page (sign-in, Module Home) calls it alone. A page
 * that is a breadcrumb node calls {@link useBreadcrumbsNode}, which sets the title through this hook.
 * An empty `title` (the record has not loaded) leaves the previous title.
 */
export function useWindowTitle(title: string | null | undefined, options: UseWindowTitleOptions = {}): void {
	const { enabled = true, capitalize = false } = options;
	const text = windowTitleText(title, capitalize);

	React.useEffect(() => {
		if (enabled && text) {
			document.title = text;
		}
	}, [text, enabled]);
}

export function windowTitleText(title: string | null | undefined, capitalize: boolean): string | undefined {
	if (!title) {
		return undefined;
	}
	return capitalize ? capitalizeWords(title) : title;
}
