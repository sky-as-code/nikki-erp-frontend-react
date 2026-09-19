import { z } from 'zod';

import { resourceTablePropsSchema } from '../../components/resourceTable/props';
import { resourceDetailPropsSchema } from '../resourceDetail/props';


/**
 * One tab of the related-resources section: the embedded table's own props plus the tab label.
 * `filterGraph` is interpolated from the route (`${id}`) exactly as `resourceTable` does, and the
 * section is update-mode only for the same reason — on `/new` there is no id to filter by.
 */
export const relatedResourceSchema = resourceTablePropsSchema.extend({
	/** i18n key for the tab, translated with the related resource's own `translationNs`. */
	label: z.string().min(1),
}).strict();

export const resourceDetailV2PropsSchema = resourceDetailPropsSchema.extend({
	relatedResources: z.array(relatedResourceSchema).default([]),
	/** i18n key for the section heading, translated with the page's `translationNs`. */
	relatedResourcesHeader: z.string().min(1).optional(),
}).strict();

export type RelatedResource = z.infer<typeof relatedResourceSchema>;
export type ResourceDetailV2Props = z.infer<typeof resourceDetailV2PropsSchema>;
export type ResourceDetailV2PropsInput = z.input<typeof resourceDetailV2PropsSchema>;
