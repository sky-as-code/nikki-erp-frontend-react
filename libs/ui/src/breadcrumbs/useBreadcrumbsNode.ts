import React from 'react';
import { useLocation } from 'react-router-dom';

import { useSetNodeInfo } from './NavHistoryProvider';
import { useWindowTitle, windowTitleText } from './useWindowTitle';


export type UseBreadcrumbsNodeOptions = {
	/** The tab title, and the page's label in every breadcrumb that shows it. */
	title: string | null | undefined,
	/** Capitalises every word of the title, in the tab and the crumb alike: list pages. Default `false`. */
	capitalizeTitle?: boolean,
	/** The node to name when it is not the pathname, e.g. the list pane of a split view. */
	nodePath?: string,
	/** `false` does nothing, e.g. that list pane while a record is open beside it. Default `true`. */
	enabled?: boolean,
};

/**
 * Registers the page as a breadcrumb node; a page that does not call it is no node, and the page reached
 * from it starts a new trail. Also sets the tab title through {@link useWindowTitle} and stores the same
 * text as the node's label on the history entry, so crumbs on later pages show it without a lookup.
 * The node registers on mount; an empty `title` (the record has not loaded) only delays the label, so
 * the crumb keeps its skeleton.
 */
export function useBreadcrumbsNode(options: UseBreadcrumbsNodeOptions): void {
	const { title, capitalizeTitle = false, nodePath, enabled = true } = options;
	const location = useLocation();
	const setNodeInfo = useSetNodeInfo();
	const path = nodePath ?? location.pathname;
	const label = windowTitleText(title, capitalizeTitle);

	useWindowTitle(title, { enabled, capitalize: capitalizeTitle });

	// A layout effect, so the node is registered before any effect of the page navigates away from it.
	React.useLayoutEffect(() => {
		if (enabled) {
			setNodeInfo?.(path, { registered: true });
		}
	}, [enabled, path, setNodeInfo, location.key]);

	React.useEffect(() => {
		if (enabled && label) {
			setNodeInfo?.(path, { label });
		}
	}, [label, enabled, path, setNodeInfo]);
}
