import React from 'react';
import { Provider as ReduxProvider, createDispatchHook, createSelectorHook, createStoreHook } from 'react-redux';

import { moduleStoreRegistry } from './moduleStoreRegistry';

import type { ReactReduxContextValue } from 'react-redux';


/**
 * A react-redux context of its own, kept separate from the default one.
 *
 * The Shell store owns the default context, and the legacy micro-app hooks
 * (`useMicroAppSelector`, `useRootSelector`) read it. Mounting a module store on the
 * default context would silently repoint those at the wrong store, so module state
 * lives here instead — which also means the Shell cannot read a micro-app's state,
 * and neither can a sibling.
 */
export const ModuleStoreContext = React.createContext<ReactReduxContextValue | null>(null);

export const useModuleDispatch = createDispatchHook(ModuleStoreContext as any);
export const useModuleSelector = createSelectorHook(ModuleStoreContext as any);
export const useModuleStore = createStoreHook(ModuleStoreContext as any);

export type ModuleStoreProviderProps = React.PropsWithChildren<{
	/** Registry key: the micro-app slug, or `shell`. */
	moduleName: string,
}>;

/**
 * Mounts the module's own Redux store, if it created one.
 *
 * A module without a store renders untouched, so modules still on the Shell's shared
 * store keep working unchanged.
 */
export function ModuleStoreProvider({ moduleName, children }: ModuleStoreProviderProps): React.ReactNode {
	const moduleStore = moduleStoreRegistry.get(moduleName);
	if (!moduleStore) return children;

	return (
		<ReduxProvider store={moduleStore.store} context={ModuleStoreContext as any}>
			{children}
		</ReduxProvider>
	);
}
