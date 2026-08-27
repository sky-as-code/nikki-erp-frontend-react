/**
 * Contribution ids owned by this kit.
 *
 * Format is `{vendor}.{kit}.{kind}.{name}.v{major}` — see "docs/wiki/03. View engine.md" §3.2.
 * `{kit}` names the folder these live in, so an id read in a page definition points at its
 * source. A component that is a *part of* another carries a dotted parent path
 * (`resourceForm.column`), which keeps the parts of one composite adjacent when the registry
 * is listed alphabetically.
 *
 * The major version is part of the id: a breaking props change ships as a new `.v2` id
 * registered alongside `.v1`, never as a mutation of the existing schema.
 */
export const MANTINE_VIEW_KIT_ID = 'nikkierp.mantine';

export const RESOURCE_LIST_TEMPLATE = 'nikkierp.mantine.pages.templates.resourceList.v1';
export const RESOURCE_DETAIL_TEMPLATE = 'nikkierp.mantine.pages.templates.resourceDetails.v1';
export const RESOURCE_SPLIT_VIEW_TEMPLATE = 'nikkierp.mantine.pages.templates.resourceSplitView.v1';

export const PAGE_HEADER = 'nikkierp.mantine.components.pageHeader.v1';
export const COLLAPSIBLE_SECTION = 'nikkierp.mantine.components.collapsibleSection.v1';
export const RESOURCE_TABLE = 'nikkierp.mantine.components.resourceTable.v1';
export const RESOURCE_DETAIL_HEADER = 'nikkierp.mantine.components.resourceDetail.header.v1';
export const RESOURCE_FORM = 'nikkierp.mantine.components.resourceForm.v1';
export const RESOURCE_FORM_COLUMN = 'nikkierp.mantine.components.resourceForm.column.v1';
export const RESOURCE_CREATE_HEADER = 'nikkierp.mantine.components.resourceCreate.header.v1';
export const RESOURCE_CREATE_FORM = 'nikkierp.mantine.components.resourceCreate.form.v1';
export const RESOURCE_SPLIT_VIEW = 'nikkierp.mantine.components.resourceSplitView.v1';

/**
 * A tabbed container for a resource detail page. Like `collapsibleSection` it groups nodes, but it
 * renders the enclosing form's `SectionActionBar`, so it belongs inside the resource-update family
 * and nowhere else.
 */
export const RESOURCE_FORM_TABS = 'nikkierp.mantine.components.resourceFormTabs.v1';
export const RESOURCE_FORM_TABS_TAB = 'nikkierp.mantine.components.resourceFormTabs.tab.v1';

/**
 * Like `collapsibleSection` with `layout: 'formBlocks'`, but once its block count passes
 * `minBlockCountWithoutTabs` it narrows to one visible block at a time via a `SegmentedControl`
 * (`[All] | [Block 1] | ...`) instead of showing every block's fields at once.
 */
export const TAB_COLLAPSIBLE_SECTION = 'nikkierp.mantine.components.tabCollapsibleSection.v1';

/**
 * The settings pane a feature module contributes as its `pages.settings` widget.
 *
 * A settings pane is not a resource detail page: it edits values that live in the settings
 * module's own store, keyed by name and level rather than by record id, and each item can be
 * locked by a tenant. It therefore has its own small pair of contributions rather than reusing
 * the resource-form family.
 */
export const SETTINGS_SECTION = 'nikkierp.mantine.components.settingsSection.v1';
export const SETTINGS_ITEM = 'nikkierp.mantine.components.settingsItem.v1';

/**
 * Field-renderer spec names registered by this kit.
 *
 * Deliberately bare, not contribution ids: `registerFieldRenderer(name, factory)` keys its own
 * namespace, and these names appear inline in page JSON as `{ renderer: 'badge' }` where a
 * five-segment id would drown the spec it labels.
 */
export const FIELD_RENDERER_AVATAR = 'avatar';
export const FIELD_RENDERER_BADGE = 'badge';
export const FIELD_RENDERER_TRANSLATED = 'translated';
