import React from 'react';

import { AppRoute, AppRoutes, MicroAppProps, MicroAppRouter } from '../microApp';
import { ResourceDetail } from './templates/ResourceDetail';
import { ResourceList } from './templates/ResourceList';


const RESOURCE_LIST_TEMPLATE = 'nikkierp.mantine.pages.templates.resourceList.v1';
const RESOURCE_DETAIL_TEMPLATE = 'nikkierp.mantine.pages.templates.resourceDetails.v1';

const templateRegistry = new Map<string, React.ComponentType<any>>([
	[RESOURCE_LIST_TEMPLATE, ResourceList],
	[RESOURCE_DETAIL_TEMPLATE, ResourceDetail],
]);

export type ViewEngineRouterProps = {
	microAppProps: MicroAppProps,
	engineProps: EngineProps,
};

export type EngineProps = {
	pages: any[],
};

export function ViewEngineRouter({ microAppProps, engineProps }: ViewEngineRouterProps) {
	return (
		<MicroAppRouter {...microAppProps}>
			<AppRoutes>
				<AppRoute index element={<h1>Identity</h1>} />
				{engineProps.pages.map((page: any) => (
					<AppRoute key={page.routePath} path={page.routePath} element={determineElem(page)} />
				))}
			</AppRoutes>
		</MicroAppRouter>
	);
}

function determineElem(page: EngineProps['pages'][number]) {
	const Component = templateRegistry.get(page.template)!;
	const props = buildTemplateProps(page);
	return <Component props={props} />;
}

function buildTemplateProps(page: EngineProps['pages'][number]) {
	if (page.template === RESOURCE_DETAIL_TEMPLATE) {
		return { ...page.templateProps, sections: page.sections ?? [] };
	}
	return page.templateProps;
}
