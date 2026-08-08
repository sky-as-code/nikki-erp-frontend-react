import React from 'react';

import type { IViewEngine } from '../core';


/**
 * Carries the host-owned engine down the tree.
 *
 * Context rather than a module-scope variable captured at `init()`: a micro-app
 * may mount as SHARED (light DOM, rendered by the parent React tree) or ISOLATED
 * (shadow DOM, its own React root). Context is the only mechanism that works for
 * both, and it is exactly how `commandBus` is already delivered.
 */
const ViewEngineContext = React.createContext<IViewEngine | null>(null);

export type ViewEngineProviderProps = {
	engine: IViewEngine,
	children: React.ReactNode,
};

export function ViewEngineProvider({ engine, children }: ViewEngineProviderProps): React.ReactNode {
	return <ViewEngineContext.Provider value={engine}>{children}</ViewEngineContext.Provider>;
}

export function useViewEngine(): IViewEngine {
	const engine = React.useContext(ViewEngineContext);
	if (!engine) {
		throw new Error('useViewEngine must be used within a ViewEngineProvider (see MicroAppProvider).');
	}
	return engine;
}

/** Non-throwing variant for components that can degrade without an engine. */
export function useOptionalViewEngine(): IViewEngine | null {
	return React.useContext(ViewEngineContext);
}
