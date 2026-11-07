import {
	AppRoute, AppRoutes, MicroAppProps, MicroAppRouter, WidgetRoute, WidgetRoutes,
} from '@nikkierp/ui/microApp';
import { compilePage } from '@nikkierp/viewengine/metadata';
import { useViewEngine } from '@nikkierp/viewengine/render';
import React from 'react';

import { OwnerMicroAppGate } from './components/ownerMicroAppGate/OwnerMicroAppGate';
import { buildModuleRoutes, ModuleRoutesContext, routeRoot } from './data/moduleRoutes';
import { PageReadGuard } from './permissions/PageReadGuard';

import type { WidgetComponentProps } from '@nikkierp/ui/microApp';
import type { PageNode } from '@nikkierp/viewengine/metadata';


export type ViewEngineRouterProps = {
	microAppProps: MicroAppProps,
	engineProps: EngineProps,
};

/**
 * One named, route-free entry point this module exposes for other micro-apps to mount.
 *
 * The name is the whole contract: a consumer names a slug and this string, never an import. See
 * `docs/wiki/01. Micro Frontend architecture.md` §Widgets.
 */
export type WidgetDefinition = {
	name: string,
	Component: React.ComponentType<WidgetComponentProps>,
};

export type EngineProps = {
	pages: PageNode[],
	/**
	 * Element for the micro-app's index route. Supplied by the owning module --
	 * this used to be a hardcoded `<h1>Identity</h1>` inside a shared library,
	 * so every module that adopted the router rendered IAM's landing page.
	 */
	indexElement?: React.ReactNode,
	/**
	 * Widgets this module exposes, if any.
	 *
	 * Declared as data rather than as `<WidgetRoute>` children because this router owns the
	 * `MicroAppRouter` element and a module using it has nowhere to put them. Without this a
	 * module routed through here could not expose a widget at all, which is why `identity` had
	 * no settings pane while `essential` -- which drives `MicroAppRouter` directly -- did.
	 */
	widgets?: WidgetDefinition[],
	/**
	 * Proxy pages: copies of another micro-app's pages, by route path → slug of the owning micro-app.
	 * Each renders only once its owner is loaded, since the copy relies on the owner's view-kit
	 * components and services; and links to these routes stay in this module.
	 */
	proxyPages?: Record<string, string>,
};

export function ViewEngineRouter({ microAppProps, engineProps }: ViewEngineRouterProps): React.ReactNode {
	const engine = useViewEngine();
	const compiled = React.useMemo(
		() => engineProps.pages.map(page => ({ page, ...compilePage(page, engine) })),
		[engineProps.pages, engine],
	);

	const widgets = engineProps.widgets;
	const proxyPages = engineProps.proxyPages;
	const moduleRoutes = React.useMemo(
		() => buildModuleRoutes(compiled.map(page => page.routePath), proxyPages),
		[compiled, proxyPages],
	);

	return (
		<ModuleRoutesContext.Provider value={moduleRoutes}>
			<MicroAppRouter {...microAppProps}>
				<AppRoutes>
					{engineProps.indexElement ? <AppRoute index element={engineProps.indexElement} /> : null}
					{compiled.map(page => (
						<AppRoute
							key={page.routePath}
							path={page.routePath}
							element={withOwner(proxyPages?.[routeRoot(page.routePath)],
								<PageReadGuard page={page.page}>{page.element}</PageReadGuard>)}
						/>
					))}
				</AppRoutes>
				{/* Omitted entirely when the module exposes none: every child of `<WidgetRoutes>`
				must be a `<WidgetRoute>`, so an empty group is the safer shape than one holding
				a conditional. */}
				{widgets && widgets.length > 0 ? (
					<WidgetRoutes>
						{widgets.map(widget => (
							<WidgetRoute key={widget.name} name={widget.name} Component={widget.Component} />
						))}
					</WidgetRoutes>
				) : null}
			</MicroAppRouter>
		</ModuleRoutesContext.Provider>
	);
}

function withOwner(ownerSlug: string | undefined, element: React.ReactNode): React.ReactNode {
	return ownerSlug ? <OwnerMicroAppGate ownerSlug={ownerSlug}>{element}</OwnerMicroAppGate> : element;
}
