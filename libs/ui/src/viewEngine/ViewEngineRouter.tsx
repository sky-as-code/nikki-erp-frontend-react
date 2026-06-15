import React from 'react';

import './pageTemplates';
import './componentRenderers';
import { compilePage, PageNode } from './metadata';
import { AppRoute, AppRoutes, MicroAppProps, MicroAppRouter } from '../microApp';


export type ViewEngineRouterProps = {
	microAppProps: MicroAppProps,
	engineProps: EngineProps,
};

export type EngineProps = {
	pages: PageNode[],
};

export function ViewEngineRouter({ microAppProps, engineProps }: ViewEngineRouterProps) {
	const compiled = React.useMemo(
		() => engineProps.pages.map(page => compilePage(page)),
		[engineProps.pages],
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
