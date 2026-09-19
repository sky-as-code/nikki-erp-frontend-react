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


export type SplitViewPrimaryState = {
	/**
	 * Closes the list pane, leaving the detail pane fullscreen. Undefined when there is nothing to
	 * close back to — a list rendered on its own, or a split view showing only the list.
	 */
	closePane?: () => void,
	/** Label for the close control, translated by the layout that owns the action. */
	closeLabel?: string,
};

/** Provided by `SplitViewBody` around the primary pane, and nowhere else. */
export const SplitViewPrimaryContext = React.createContext<SplitViewPrimaryState>({});

/**
 * The list pane's own close action, for a template that wants to place it among its toolbar
 * controls rather than let the layout float one over the pane's top-right corner.
 */
export function useClosePrimaryPane(): SplitViewPrimaryState {
	return React.useContext(SplitViewPrimaryContext);
}
