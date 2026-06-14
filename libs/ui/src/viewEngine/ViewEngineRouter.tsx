import React from 'react';

import './pageTemplates';
import './componentRenderers';
import { AdapterContext, compilePage, PageNode } from './metadata';
import { AppRoute, AppRoutes, MicroAppProps, MicroAppRouter } from '../microApp';


export type ViewEngineRouterProps = {
	microAppProps: MicroAppProps,
	engineProps: EngineProps,
};

export type EngineProps = {
	pages: PageNode[],
};


export function ViewEngineRouter({ microAppProps, engineProps }: ViewEngineRouterProps) {
	const ctx = React.useMemo<AdapterContext>(
		() => ({ commandBus: microAppProps.commandBus }),
		[microAppProps.commandBus],
	);
	const compiled = React.useMemo(
		() => engineProps.pages.map(page => compilePage(page, ctx)),
		[engineProps.pages, ctx],
	);

	return (
		<MicroAppRouter {...microAppProps}>
			<AppRoutes>
				<AppRoute index element={<h1>Identity</h1>} />
				{compiled.map(page => (
					<AppRoute key={page.routePath} path={page.routePath} element={page.element} />
				))}
			</AppRoutes>
		</MicroAppRouter>
	);
}
