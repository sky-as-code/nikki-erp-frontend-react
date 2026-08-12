import React from 'react';


export type SplitViewSecondaryState = {
	/** True inside a split view's detail pane, false on a standalone detail page. */
	isSecondary: boolean,
	/**
	 * True while the list pane sits beside the detail pane. False when the detail pane fills the
	 * view — on a deep link, where the user never came from the list and so has nothing to go back
	 * to in the pane sense.
	 */
	isPrimaryOpen: boolean,
};

const DETACHED: SplitViewSecondaryState = { isSecondary: false, isPrimaryOpen: false };

/** Provided by `SplitViewBody` around the secondary pane, and nowhere else. */
export const SplitViewSecondaryContext = React.createContext<SplitViewSecondaryState>(DETACHED);

/**
 * True when the subtree renders inside a split view's detail pane, false when the
 * same page is reached directly by its own URL. Lets a detail page offer actions
 * that only make sense while a list is visible next to it, such as closing the pane.
 */
export function useIsSplitViewSecondary(): boolean {
	return React.useContext(SplitViewSecondaryContext).isSecondary;
}

/**
 * True when a detail pane can be closed back to its list: it must be a secondary pane *and* the
 * list must actually be on screen. In fullscreen the same close would leave the view empty, so
 * the action is withheld rather than offered.
 */
export function useCanClosePane(): boolean {
	const { isSecondary, isPrimaryOpen } = React.useContext(SplitViewSecondaryContext);
	return isSecondary && isPrimaryOpen;
}
