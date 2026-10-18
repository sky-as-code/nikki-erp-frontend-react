import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useResourceUpdateContext } from './resourceUpdateContext';
import { useRoutePathHref } from '../../data/useResourceLinkHref';


export type BackLinkTarget = {
	/** Path-relative when the page's `linkHref` is (`'../'`); resolve it with `relative: 'path'`. */
	href: string,
	go: () => void,
};

// A page without `backLinkTitle` still has somewhere to go back to: every resource detail route
// sits one segment under its list.
const DEFAULT_BACK_HREF = '../';

/**
 * Where the header's back link points, for code that leaves the record without clicking it: the
 * redirect after a delete (a refresh would re-fetch a record that is gone) and the Not Found state.
 *
 * `go` replaces the history entry, so browser Back does not return to a record that is gone.
 */
export function useBackLinkTarget(): BackLinkTarget {
	const { backLinkTitle } = useResourceUpdateContext();
	const navigate = useNavigate();
	// `undefined` while a `:param` of an absolute path is still unknown; the list is the safe bet.
	const href = useRoutePathHref(backLinkTitle?.linkHref ?? DEFAULT_BACK_HREF) ?? DEFAULT_BACK_HREF;
	const go = React.useCallback(() => {
		void navigate(href, { relative: 'path', replace: true });
	}, [navigate, href]);
	return { href, go };
}
