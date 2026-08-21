export * from './ids';
export * from './props';
export { mantineViewKit } from './kit';
export { contributeMantineViewKit } from './contributeMantineViewKit';
export { ViewEngineRouter } from './ViewEngineRouter';
export type { ViewEngineRouterProps } from './ViewEngineRouter';
export { PageContainer } from './components/PageContainer';
export { PageHeaderProvider } from './components/pageHeader/pageHeaderContext';
export type { PageHeaderContextValue } from './components/pageHeader/pageHeaderContext';
export { ResourceList } from './pages/resourceList/ResourceList';
export { ResourceDetail } from './pages/resourceDetail/ResourceDetail';
export { SplitViewBody } from './pages/resourceSplitView/SplitViewBody';
export { SplitLayout } from './pages/resourceSplitView/SplitLayout';

/**
 * The resource search lifecycle, for a module building its own list-shaped page template.
 *
 * A bespoke template (a map view, a calendar) still wants the same schema pack, the same search
 * command and the same stale-request handling the stock list uses; re-implementing it in a module
 * is how the two drift apart.
 */
export { useResourceSearch } from './data/useResourceSearch';
export type {
	UseResourceSearchOptions, UseResourceSearchResult,
} from './data/useResourceSearch';
/**
 * Row-link builders, for a module template that renders its own `DataTable` and so cannot
 * inherit the `href` wiring `resourceList` does for free. A module must not rebuild the URL
 * shape by hand: `/{orgSlug}/{moduleSlug}/{routePath}/{id}` is owned here.
 */
export { useResourceBaseHref, useResourceLinkHref, useRoutePathHref } from './data/useResourceLinkHref';
