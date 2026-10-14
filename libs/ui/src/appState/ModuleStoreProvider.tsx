import { configureStore } from '@reduxjs/toolkit';
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

/** Only for the tree above any registered store, so the Provider below never has to be omitted. */
const inertStore = configureStore({ reducer: (state: Record<string, unknown> = {}) => state });

/**
 * Mounts the module's own Redux store, if it created one.
 *
 * A module without a store keeps the store it inherits, so modules still on the Shell's shared
 * store keep working unchanged.
 *
 * The Provider is rendered either way, and the registry is subscribed to. A module creates its
 * store when `store.ts` is first imported, which a lazily loaded command handler may do after the
 * first render. Rendering bare children until then, and a Provider after, changed the tree's shape
 * on the next re-render and remounted the whole page under it: a split view opened from its list
 * lost the list pane on the first click and on that one only.
 */
export function ModuleStoreProvider({ moduleName, children }: ModuleStoreProviderProps): React.ReactNode {
	const moduleStore = React.useSyncExternalStore(
		moduleStoreRegistry.subscribe,
		() => moduleStoreRegistry.get(moduleName),
	);
	const inheritedStore = React.useContext(ModuleStoreContext)?.store;

	return (
		<ReduxProvider store={moduleStore?.store ?? inheritedStore ?? inertStore} context={ModuleStoreContext as any}>
			{children}
		</ReduxProvider>
	);
}
