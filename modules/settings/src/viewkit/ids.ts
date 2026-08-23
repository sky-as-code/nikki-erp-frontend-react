/**
 * Contribution ids owned by the settings module's own view kit.
 *
 * Format is `{vendor}.{kit}.{kind}.{name}.v{major}`, same as the Mantine kit. The vendor is
 * `nikkierp` and so is the kit id, which is what the engine's vendor policy checks: a kit may
 * freely create ids under its own vendor, and only a *foreign* vendor is blocked from minting
 * `nikkierp.*` ids. A breaking props change ships as a new `.v2` id, never as a mutation.
 *
 * These live here rather than in `viewkit-mantine` because the settings page is not a
 * general-purpose template: it is a rail of micro-app slugs beside a mounted foreign widget,
 * which only this module has any reason to render.
 */
export const SETTINGS_VIEW_KIT_ID = 'nikkierp.settings';

export const SETTINGS_PAGE_TEMPLATE = 'nikkierp.settings.pages.templates.settingsPage.v1';

/*
 * The page's own pieces. They are registered rather than composed as JSX because a page -- and a
 * page template -- must not import a custom component directly: everything visual resolves
 * through the registry, so it can be placed, reordered or overridden without editing React.
 *
 * All three carry the `settingsPage.` parent path: none of them is meaningful away from this
 * page. The rail is a list of *this page's* panes, and the pane host mounts whichever widget the
 * rail has selected -- neither has a use elsewhere, unlike identity's `rolePicker`.
 */
export const SETTINGS_PAGE_TITLE = 'nikkierp.settings.components.settingsPage.title.v1';
export const SETTINGS_PAGE_RAIL = 'nikkierp.settings.components.settingsPage.rail.v1';
export const SETTINGS_PAGE_PANE = 'nikkierp.settings.components.settingsPage.pane.v1';

/**
 * The two-column frame holding the rail and the pane.
 *
 * It exists as its own contribution because `SplitLayout` takes *render callbacks*, which cannot
 * survive `JSON.stringify` and so cannot be authored in page JSON. This node owns those
 * callbacks and renders its two children into them by position -- first child left, second
 * right -- which keeps the page tree plain metadata.
 */
export const SETTINGS_PAGE_SPLIT = 'nikkierp.settings.components.settingsPage.split.v1';
