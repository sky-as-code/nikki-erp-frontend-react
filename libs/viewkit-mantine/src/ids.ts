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

/** The resource list on the composable `ExcelDataTable`, with `updateCommand` and `viewModes`. */
export const RESOURCE_LIST_V2_TEMPLATE = 'nikkierp.mantine.pages.templates.resourceList.v2';
/** The resource detail, with a related-resources tab section, each tab an `ExcelDataTable`. */
export const RESOURCE_DETAIL_V2_TEMPLATE = 'nikkierp.mantine.pages.templates.resourceDetails.v2';
export const RESOURCE_SPLIT_VIEW_TEMPLATE = 'nikkierp.mantine.pages.templates.resourceSplitView.v1';
export const RESOURCE_IMPORT_TEMPLATE = 'nikkierp.mantine.pages.templates.resourceImport.v1';

/**
 * A page that belongs to one resource but is not its CRUD form — an import wizard, a bulk action,
 * a report scoped to the resource. Same shell and header as the detail page, no update context.
 */
export const RESOURCE_GENERIC_PAGE_TEMPLATE = 'nikkierp.mantine.pages.templates.resourceGenericPage.v1';

export const PAGE_HEADER = 'nikkierp.mantine.components.pageHeader.v1';
export const COLLAPSIBLE_SECTION = 'nikkierp.mantine.components.collapsibleSection.v1';
/**
 * `ExcelDataTable`'s row body, so a list template's `list` view mode is a node like any other and
 * a page can swap in its own. Valid only inside an `ExcelDataTable.Provider`, which the enclosing
 * template mounts — it reads every row, column and selection off that context.
 */
export const EXCEL_DATA_TABLE_BODY = 'nikkierp.mantine.components.excelDataTable.tableBody.v1';
export const RESOURCE_FORM_COLUMN = 'nikkierp.mantine.components.resourceForm.column.v1';
export const RESOURCE_FILE_FIELD = 'nikkierp.mantine.components.resourceForm.fileField.v1';

/**
 * The detail template's form components. Pages author columns with the `.v1` `RESOURCE_FORM_COLUMN`
 * id, which the detail template retargets to `RESOURCE_FORM_COLUMN_V2`. Nothing renders the `.v1` id
 * itself, so a column is valid only inside a detail template's `createNodes` / `childrenNodes`.
 */
export const RESOURCE_DETAIL_HEADER_V2 = 'nikkierp.mantine.components.resourceDetail.header.v2';
export const RESOURCE_FORM_V2 = 'nikkierp.mantine.components.resourceForm.v2';
export const RESOURCE_FORM_COLUMN_V2 = 'nikkierp.mantine.components.resourceForm.column.v2';
export const RESOURCE_CREATE_HEADER_V2 = 'nikkierp.mantine.components.resourceCreate.header.v2';
export const RESOURCE_CREATE_FORM_V2 = 'nikkierp.mantine.components.resourceCreate.form.v2';
export const RESOURCE_SPLIT_VIEW = 'nikkierp.mantine.components.resourceSplitView.v1';

/**
 * The header of a `resourceGenericPage`: the resource-detail header's layout and back link,
 * without any of its CRUD machinery.
 *
 * It is a separate contribution rather than a mode of `resourceDetail.header` because the two
 * differ in what they read, not merely in what they show: the detail header requires the
 * resource-update context and builds its own action row from that page's commands, while this one
 * has no record, no form and no commands, and takes its action row from its child nodes the way
 * `pageHeader` does.
 */
export const RESOURCE_GENERIC_PAGE_HEADER = 'nikkierp.mantine.components.resourceGenericPage.header.v1';

/**
 * The import wizard's two contributions: the buttons that drive the current step, which the
 * generic page renders in its header's action row, and the step's own body. Both read the live
 * wizard from React context — only their ids travel in the page's node tree.
 */
export const RESOURCE_IMPORT_ACTIONS = 'nikkierp.mantine.components.resourceImport.actions.v1';
export const RESOURCE_IMPORT_BODY = 'nikkierp.mantine.components.resourceImport.body.v1';

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
/** A decimal shown as money with a page-declared currency symbol; the schema has no money type. */
export const FIELD_RENDERER_MONEY = 'money';
export const FIELD_RENDERER_INTEGER = 'integer';
export const FIELD_RENDERER_FLOAT = 'float';
/** A filled badge with a translated label, coloured per value. */
export const FIELD_RENDERER_ENUM = 'enum';
export const FIELD_RENDERER_ATTRIBUTE_PILLS = 'attributePills';
