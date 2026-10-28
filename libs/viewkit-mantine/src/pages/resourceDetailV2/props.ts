import { fieldRendererSpecSchema } from '@nikkierp/viewengine/schema';
import { z } from 'zod';

import { resourceTablePropsSchema } from '../../components/resourceTable/props';
import { resourceThumbnailSpecSchema } from '../../components/resourceThumbnail/props';
import { resourceDetailPropsSchema } from '../resourceDetail/props';


/**
 * Assign and remove the listed records from the page's own record, e.g. users on a role. The table
 * gets an insert row whose record picker assigns and a per-row Unassign button, and no toolbar
 * actions. Every change publishes `manageCommand` with `{id, add?, remove?}` (`id` = the route's
 * `:id`) and takes effect at once.
 */
export const relatedAssignmentSchema = z.object({
	/** Schema the picker searches; usually the tab's own `schemaName`. */
	pickerSchemaName: z.string().min(1),
	/** Published with `{id, add?: string[], remove?: string[]}`. */
	manageCommand: z.string().min(1),
	/** The backend action `manageCommand` asserts, copied from the application service. */
	actionCode: z.string().min(1),
	/** The resource `actionCode` is asserted on. Defaults to the tab's `schemaName`. */
	actionResource: z.string().min(1).optional(),
	actionScope: z.enum(['tenant', 'org', 'orgunit', 'private']).optional(),
	/** i18n key of the insert button's label, translated with the tab's `translationNs`. */
	newRowPrompt: z.string().min(1).optional(),
	/**
	 * The column the insert row's record picker sits in, moved first. Defaults to the tab's first
	 * field; name the record-label column when the first one is narrow (an avatar).
	 */
	newRowSearchField: z.string().min(1).optional(),
	/** i18n key of the row delete button, `ns:key` for a namespace other than `common`. */
	btnDeleteLabel: z.string().min(1).optional(),
}).strict();

/**
 * One tab of the related-resources section: the embedded table's own props plus the tab label.
 * `initialGraph` is interpolated from the route (`${id}`) exactly as `resourceTable` does, and the
 * section is update-mode only for the same reason — on `/new` there is no id to filter by. While
 * the form is being edited, the tab hides what navigates (row links, "View all", link actions).
 */
export const relatedResourceSchema = resourceTablePropsSchema.extend({
	/** i18n key for the tab, translated with the related resource's own `translationNs`. */
	label: z.string().min(1),
	/** i18n key of the message an empty table shows, translated with the tab's `translationNs`. */
	emptyMessage: z.string().min(1).optional(),
	/** i18n key replacing the "View all" link's standard label, translated with the tab's `translationNs`. */
	viewAllLabel: z.string().min(1).optional(),
	/**
	 * "View all" opens the list filtered as this tab is: its interpolated `initialGraph` rides along
	 * as the list's `?initialGraph=`, e.g. a template's variants rather than every variant.
	 */
	viewAllFiltered: z.boolean().optional(),
	/**
	 * How "View all" renders: `action_link` (the default) a link button, `link` a text link for a
	 * navigation that should not read as an action. `action` would have no click to fire.
	 */
	viewAllType: z.enum(['action_link', 'link']).optional(),
	assignment: relatedAssignmentSchema.optional(),
}).strict();

export const resourceDetailV2PropsSchema = resourceDetailPropsSchema.extend({
	/** A photo of the record shown left of the header titles; editable in update mode. */
	thumbnail: resourceThumbnailSpecSchema.optional(),
	/**
	 * Values the create request always carries, with no input in the form — e.g. `{type: 'user'}`
	 * for a page that creates one kind of a shared schema. A form value of the same key wins.
	 */
	createDefaults: z.record(z.string(), z.unknown()).optional(),
	relatedResources: z.array(relatedResourceSchema).default([]),
	/** i18n key for the section heading, translated with the page's `translationNs`. */
	relatedResourcesHeader: z.string().min(1).optional(),
	/**
	 * i18n key of an info box above the tabs, translated with the page's `translationNs` — e.g.
	 * that assignments made in the tabs take effect immediately.
	 */
	relatedResourcesNotice: z.string().min(1).optional(),
	/** Read-mode renderers of the form's own fields, keyed by field name, e.g. `{renderer: 'money'}`. */
	fieldRenderers: z.record(z.string(), fieldRendererSpecSchema).optional(),
	/**
	 * Every field listed in the form blocks renders in every mode, so the layout never changes
	 * shape; a field not editable in the current mode renders read-only, and an empty one as `-`.
	 */
	stableFieldLayout: z.boolean().optional(),
	/**
	 * Where the `allStatuses` flow renders on an existing record: `toolbar`, in the header's right
	 * toolbar (read mode only), or `firstSection`, as the first full-width row of the first section
	 * (every mode).
	 */
	statusPlacement: z.enum(['toolbar', 'firstSection']).default('toolbar'),
}).strict();

export type RelatedResource = z.infer<typeof relatedResourceSchema>;
export type RelatedAssignment = z.infer<typeof relatedAssignmentSchema>;
export type ResourceDetailV2Props = z.infer<typeof resourceDetailV2PropsSchema>;
export type ResourceDetailV2PropsInput = z.input<typeof resourceDetailV2PropsSchema>;
