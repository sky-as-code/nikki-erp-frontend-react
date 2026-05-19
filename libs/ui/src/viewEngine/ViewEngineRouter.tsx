import React from 'react';

import { AppRoute, AppRoutes, MicroAppProps, MicroAppRouter } from '../microApp';
import { ResourceDetail } from './templates/ResourceDetail';
import { ResourceList } from './templates/ResourceList';
import { ResourceSplitView } from './templates/ResourceSplitView';


const RESOURCE_LIST_TEMPLATE = 'nikkierp.mantine.pages.templates.resourceList.v1';
const RESOURCE_DETAIL_TEMPLATE = 'nikkierp.mantine.pages.templates.resourceDetails.v1';
const RESOURCE_SPLIT_VIEW_TEMPLATE = 'nikkierp.mantine.pages.templates.resourceSplitView.v1';

const templateRegistry = new Map<string, React.ComponentType<any>>([
	[RESOURCE_LIST_TEMPLATE, ResourceList],
	[RESOURCE_DETAIL_TEMPLATE, ResourceDetail],
	[RESOURCE_SPLIT_VIEW_TEMPLATE, ResourceSplitView],
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
				{/* <AppRoute path='*' element={<DynamicRoutes pages={engineProps.pages} />} /> */}
				{engineProps.pages.map(page => (
					<AppRoute key={page.routePath} path={resolveRoutePath(page)} element={determineElem(page)} />
				))}
			</AppRoutes>
		</MicroAppRouter>
	);
}


/**
 * Renders the registered pages inside an inner <Routes>. The page list is
 * filtered against the current URL: when the URL has been claimed by a split
 * view, detail routes are removed from the inner list so the split view's
 * `routePath/:id?` pattern wins. Because the split view route element is the
 * same React element before and after the filter, react-router keeps the
 * existing split view mounted (no remount / no UI flash).
 *
 * On a hard reload the claim set is empty, so detail routes remain in the
 * inner list and their more-specific `:id` pattern wins for `/resource/:id`.
 */
// function DynamicRoutes({ pages }: { pages: EngineProps['pages'] }): React.ReactNode {
// 	const location = useLocation();
// 	const { isClaimed } = useRouteClaim();
// 	const claimedHere = isClaimed(location.pathname);

// 	const filtered = React.useMemo(() => {
// 		if (!claimedHere) return pages;
// 		return pages.filter(p => p.template !== RESOURCE_DETAIL_TEMPLATE);
// 	}, [pages, claimedHere]);

// 	return (
// 		<Routes>
// 			{filtered.map(page => (
// 				<Route key={page.routePath} path={resolveRoutePath(page)} element={determineElem(page)} />
// 			))}
// 		</Routes>
// 	);
// }


function determineElem(page: EngineProps['pages'][number]): React.ReactNode {
	const Component = templateRegistry.get(page.template)!;
	// switch (page.template) {
	// 	case RESOURCE_SPLIT_VIEW_TEMPLATE:
	// 		return <ResourceSplitView props={page.templateProps} routePath={page.routePath} />;
	// 	case RESOURCE_LIST_TEMPLATE:
	// 		return <ResourceList props={page.templateProps} routePath={page.routePath} />;
	// 	case RESOURCE_DETAIL_TEMPLATE:
	// 		return <ResourceDetail props={page.templateProps} />;
	// 	default:
	// 		return <Component props={page.templateProps} />;
	// }
	return <Component props={page.templateProps} routePath={page.routePath} />;
}


function resolveRoutePath(page: EngineProps['pages'][number]): string {
	// Split view matches both the list URL and the list/:id detail URL so it can
	// stay mounted when soft-navigating from list to detail.
	if (page.template === RESOURCE_SPLIT_VIEW_TEMPLATE) {
		return `${page.routePath}/:id?`;
	}
	return page.routePath;
}
