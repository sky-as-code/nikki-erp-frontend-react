import React from 'react';


/**
 * The pages the micro-app being rendered serves, by the first segment of their route path, and the
 * proxy pages among them with the module owning each. `ViewEngineRouter` provides it, so a link to a
 * schema this module has no page for can go to the module that owns the schema instead.
 */
export type ModuleRoutes = {
	/** First route segment of every page this module registers, proxy pages included. */
	routes: ReadonlySet<string>,
	/** First route segment of a proxy page → slug of the micro-app owning the copied page. */
	proxyPages: Readonly<Record<string, string>>,
};

export const ModuleRoutesContext = React.createContext<ModuleRoutes | null>(null);

export function useModuleRoutes(): ModuleRoutes | null {
	return React.useContext(ModuleRoutesContext);
}

/** The first segment of a route path: `inventory_stock_transfer/:id/x` → `inventory_stock_transfer`. */
export function routeRoot(routePath: string): string {
	return routePath.split('/').filter(Boolean)[0] ?? '';
}

export function buildModuleRoutes(
	routePaths: readonly string[], proxyPages: Readonly<Record<string, string>> = {},
): ModuleRoutes {
	const routes = new Set(routePaths.map(routeRoot).filter(Boolean));
	for (const route of Object.keys(proxyPages)) {
		routes.add(routeRoot(route));
	}
	return { routes, proxyPages };
}
