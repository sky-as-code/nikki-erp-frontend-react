import React from 'react';


/** Provided by `SplitViewBody` around the secondary pane, and nowhere else. */
export const SplitViewSecondaryContext = React.createContext(false);

/**
 * True when the subtree renders inside a split view's detail pane, false when the
 * same page is reached directly by its own URL. Lets a detail page offer actions
 * that only make sense while a list is visible next to it, such as closing the pane.
 */
export function useIsSplitViewSecondary(): boolean {
	return React.useContext(SplitViewSecondaryContext);
}
