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
 * section is update-mode only for the same reason — on `/new` there is no id to filter by.
 */
export const relatedResourceSchema = resourceTablePropsSchema.extend({
	/** i18n key for the tab, translated with the related resource's own `translationNs`. */
	label: z.string().min(1),
	/** i18n key of the message an empty table shows, translated with the tab's `translationNs`. */
	emptyMessage: z.string().min(1).optional(),
	assignment: relatedAssignmentSchema.optional(),
}).strict();

export const resourceDetailV2PropsSchema = resourceDetailPropsSchema.extend({
	/** A photo of the record shown left of the header titles; editable in update mode. */
	thumbnail: resourceThumbnailSpecSchema.optional(),
	relatedResources: z.array(relatedResourceSchema).default([]),
	/** i18n key for the section heading, translated with the page's `translationNs`. */
	relatedResourcesHeader: z.string().min(1).optional(),
	/**
	 * i18n key of an info box above the tabs, translated with the page's `translationNs` — e.g.
	 * that assignments made in the tabs take effect immediately.
	 */
	relatedResourcesNotice: z.string().min(1).optional(),
}).strict();

export type RelatedResource = z.infer<typeof relatedResourceSchema>;
export type RelatedAssignment = z.infer<typeof relatedAssignmentSchema>;
export type ResourceDetailV2Props = z.infer<typeof resourceDetailV2PropsSchema>;
export type ResourceDetailV2PropsInput = z.input<typeof resourceDetailV2PropsSchema>;
