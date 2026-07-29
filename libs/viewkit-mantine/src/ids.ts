/**
 * Contribution ids owned by this kit.
 *
 * Format is `{vendor}.{kit}.{kind}.{name}.v{major}`. The major version is part
 * of the id: a breaking props change ships as a new `.v2` id registered
 * alongside `.v1`, never as a mutation of the existing schema.
 */
export const MANTINE_VIEW_KIT_ID = 'nikkierp.mantine';

export const RESOURCE_LIST_TEMPLATE = 'nikkierp.mantine.pages.templates.resourceList.v1';
export const RESOURCE_DETAIL_TEMPLATE = 'nikkierp.mantine.pages.templates.resourceDetails.v1';
export const RESOURCE_SPLIT_VIEW_TEMPLATE = 'nikkierp.mantine.pages.templates.resourceSplitView.v1';

export const COLLAPSIBLE_SECTION = 'collapsible_section';
export const RESOURCE_DETAIL_HEADER = 'resource_detail__header';
export const RESOURCE_FORM = 'resource_form';
export const RESOURCE_FORM_COLUMN = 'resource_form__column';
export const RESOURCE_CREATE_HEADER = 'resource_create__header';
export const RESOURCE_CREATE_FORM = 'resource_create__form';
export const RESOURCE_CREATE_SECTION = 'resource_create__section';
export const RESOURCE_CREATE_COLUMN = 'resource_create__column';
export const RESOURCE_SPLIT_VIEW = 'resource_split_view';

/** Field-renderer spec names registered by this kit. */
export const FIELD_RENDERER_AVATAR = 'avatar';
export const FIELD_RENDERER_BADGE = 'badge';
export const FIELD_RENDERER_TRANSLATED = 'translated';
