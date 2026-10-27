import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { useLinkModeScope, withNavMode } from '../../breadcrumbs/NavHistoryProvider';

import type { LinkMode } from '../../breadcrumbs/trail';
import type { LinkProps as RouterLinkProps } from 'react-router-dom';


export type LinkProps = RouterLinkProps & {
	/** Starts a new breadcrumb trail: main-menu entries, Overview/Reporting links, every Create button. */
	isHistoryRoot?: boolean,
	/** How the target joins the trail; defaults to the enclosing `LinkModeScope`, else `sibling`. */
	mode?: LinkMode,
};

/**
 * React Router's `Link`, tagged with how the navigation changes the breadcrumb trail. The href is
 * untouched, so Ctrl/middle-click still opens the same page (as a fresh one-node trail).
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
	{ isHistoryRoot, mode, state, ...rest }, ref,
) {
	const scopeMode = useLinkModeScope();
	const navMode = isHistoryRoot ? 'root' : (mode ?? scopeMode);
	return <RouterLink ref={ref} state={withNavMode(state, navMode)} {...rest} />;
});
