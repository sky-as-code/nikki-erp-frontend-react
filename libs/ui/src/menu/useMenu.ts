import React from 'react';

import { IMenuReader, MenuContribution } from './types';


/**
 * Subscribes to a menu registry and returns the contribution for `slug`.
 *
 * The registry is passed in rather than pulled from a context because `@nikkierp/ui`
 * owns no Shell context; the Shell wraps this in its own `useShellMenu(slug)`.
 *
 * Never map or translate inside the snapshot — that allocates a new value per call
 * and makes `useSyncExternalStore` loop.
 */
export function useMenuContribution(registry: IMenuReader, slug?: string | null): MenuContribution | undefined {
	const getSnapshot = React.useCallback(() => registry.getMenu(slug), [registry, slug]);
	return React.useSyncExternalStore(registry.subscribe, getSnapshot, getSnapshot);
}
