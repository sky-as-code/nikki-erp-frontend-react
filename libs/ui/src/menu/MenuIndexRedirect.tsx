import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { findFirstMenuLink } from './firstMenuLink';

import type { MenuItem } from './types';


export type MenuIndexRedirectProps = {
	/** The module's own menu items, as it registers them; the index route has no page of its own. */
	items: readonly MenuItem[],
};

/**
 * A micro-app's `indexElement`: sends `/<slug>` to the module's first menu link. It takes the items
 * rather than reading the host menu registry, so it also works for an ISOLATED micro-app, which
 * runs outside the host's React context.
 */
export function MenuIndexRedirect({ items }: MenuIndexRedirectProps): ReactNode {
	const link = findFirstMenuLink(items);
	if (!link) {
		return null;
	}
	// Menu links are module-relative with a leading slash; relative navigation resolves it under the
	// micro-app's base path.
	return <Navigate to={link.replace(/^\/+/, '')} replace />;
}
