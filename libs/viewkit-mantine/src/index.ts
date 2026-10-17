export * from './ids';
export * from './props';
export { resourceListV2PropsWithViewModes } from './propsWithIcons';
export type {
	ResourceListV2PropsWithIconsInput, ViewModeInput,
} from './propsWithIcons';
export { mantineViewKit } from './kit';
export { contributeMantineViewKit } from './contributeMantineViewKit';
export { ViewEngineRouter } from './ViewEngineRouter';
export type { ViewEngineRouterProps, EngineProps, WidgetDefinition } from './ViewEngineRouter';
export { PageContainer } from './components/PageContainer';
export { PageHeader } from './components/pageHeader/PageHeader';
export type { PageHeaderViewProps } from './components/pageHeader/PageHeader';
export { PageHeaderProvider } from './components/pageHeader/pageHeaderContext';
export type { PageHeaderContextValue } from './components/pageHeader/pageHeaderContext';
export { ResourceList } from './pages/resourceList/ResourceList';
export { ResourceDetail } from './pages/resourceDetail/ResourceDetail';
export { SplitViewBody } from './pages/resourceSplitView/SplitViewBody';
export { SplitLayout } from './pages/resourceSplitView/SplitLayout';

// The settings pane's runtime half. A module's `pages.settings` widget wraps its nodes in the
// provider and renders the save bar; the item renderers read the values from that context.
export { SettingsDataProvider, useSettingsData } from './components/settings/settingsDataContext';
export type { SettingOption } from './components/settings/settingsDataContext';
export type {
	SettingItemData, SettingsDataContextValue, SettingsDataProviderProps,
} from './components/settings/settingsDataContext';
export { SettingsSaveBar } from './components/settings/settingsSaveBar';
export type { SettingsSaveBarProps } from './components/settings/settingsSaveBar';
export { SETTINGS_SAVE_REQUEST_EVENT, SETTINGS_SAVE_STATE_EVENT } from './components/settings/saveBus';
export type { SettingsSaveRequest, SettingsSaveState } from './components/settings/saveBus';

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
/**
 * Action locks, for a module's hand-written button. The derived requirement is the backend's own
 * `{action}:{schemaName}:{scope}`, so a bespoke page locks on exactly what the server asserts.
 */
export {
	actionRequirement, commandActionCode, resolveActionCode, StandardActionCode, useActionLock, useActionLocks,
} from './permissions';
export { findUngatedActions, useTableActionLocks } from './permissions';
/**
 * For a module's own section on a resource detail page: the record, its edit mode, and the hook
 * that folds the section's drafts into the page's single update request.
 */
export { useResourceUpdateContext } from './pages/resourceDetail/resourceUpdateContext';
export type { ResourceUpdateContextValue } from './pages/resourceDetail/resourceUpdateContext';
export { useResourceFormView } from './components/resourceFormViewContext';
export type { UpdatePayloadContributor } from './pages/resourceDetail/afterSave';
export type { ActionLock, LockableAction, UngatedAction } from './permissions';
