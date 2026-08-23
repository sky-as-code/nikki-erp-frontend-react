import {
	AppRoute, AppRoutes, MicroAppProps, MicroAppRouter, WidgetRoute, WidgetRoutes,
} from '@nikkierp/ui/microApp';
import { compilePage } from '@nikkierp/viewengine/metadata';
import { useViewEngine } from '@nikkierp/viewengine/render';
import React from 'react';

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
};

export function ViewEngineRouter({ microAppProps, engineProps }: ViewEngineRouterProps): React.ReactNode {
	const engine = useViewEngine();
	const compiled = React.useMemo(
		() => engineProps.pages.map(page => compilePage(page, engine)),
		[engineProps.pages, engine],
	);

	const widgets = engineProps.widgets;

	return (
		<MicroAppRouter {...microAppProps}>
			<AppRoutes>
				{engineProps.indexElement ? <AppRoute index element={engineProps.indexElement} /> : null}
				{compiled.map(page => (
					<AppRoute key={page.routePath} path={page.routePath} element={page.element} />
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
	);
}
