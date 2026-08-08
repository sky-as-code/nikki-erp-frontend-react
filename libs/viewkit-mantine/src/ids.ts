/**
 * Contribution ids owned by this kit.
 *
 * Format is `{vendor}.{kit}.{kind}.{name}.v{major}` — see "docs/03. View engine.md" §3.2.
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
export const RESOURCE_FORM_SECTION = 'nikkierp.mantine.components.resourceForm.section.v1';
export const RESOURCE_CREATE_HEADER = 'nikkierp.mantine.components.resourceCreate.header.v1';
export const RESOURCE_CREATE_FORM = 'nikkierp.mantine.components.resourceCreate.form.v1';
export const RESOURCE_CREATE_SECTION = 'nikkierp.mantine.components.resourceCreate.section.v1';
export const RESOURCE_CREATE_COLUMN = 'nikkierp.mantine.components.resourceCreate.column.v1';
export const RESOURCE_SPLIT_VIEW = 'nikkierp.mantine.components.resourceSplitView.v1';

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
