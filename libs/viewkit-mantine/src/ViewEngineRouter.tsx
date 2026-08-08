import { AppRoute, AppRoutes, MicroAppProps, MicroAppRouter } from '@nikkierp/ui/microApp';
import { compilePage } from '@nikkierp/viewengine/metadata';
import { useViewEngine } from '@nikkierp/viewengine/render';
import React from 'react';

import type { PageNode } from '@nikkierp/viewengine/metadata';


export type ViewEngineRouterProps = {
	microAppProps: MicroAppProps,
	engineProps: EngineProps,
};

export type EngineProps = {
	pages: PageNode[],
	/**
	 * Element for the micro-app's index route. Supplied by the owning module --
	 * this used to be a hardcoded `<h1>Identity</h1>` inside a shared library,
	 * so every module that adopted the router rendered IAM's landing page.
	 */
	indexElement?: React.ReactNode,
};

export function ViewEngineRouter({ microAppProps, engineProps }: ViewEngineRouterProps): React.ReactNode {
	const engine = useViewEngine();
	const compiled = React.useMemo(
		() => engineProps.pages.map(page => compilePage(page, engine)),
		[engineProps.pages, engine],
	);

	return (
		<MicroAppRouter {...microAppProps}>
			<AppRoutes>
				{engineProps.indexElement ? <AppRoute index element={engineProps.indexElement} /> : null}
				{compiled.map(page => (
					<AppRoute key={page.routePath} path={page.routePath} element={page.element} />
				))}
			</AppRoutes>
		</MicroAppRouter>
	);
}
