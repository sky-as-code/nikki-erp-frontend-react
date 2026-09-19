import { z } from 'zod';

import { resourceListPropsSchema } from '../resourceList/props';


/**
 * The v2 list page takes every v1 prop and adds what the composable table offers. `.strict()`
 * is inherited, so a misspelled key still fails at authoring time.
 */
export const resourceListV2PropsSchema = resourceListPropsSchema.extend({
	/** Publishes an inline row update `{id, etag?, ...changedFields}`; enables edit mode when set. */
	updateCommand: z.string().min(1).optional(),
	/**
	 * The view modes offered, `list` first. Only `list` renders here; another mode is a slot the
	 * page fills through its own `ForViewMode` — until then it shows nothing.
	 */
	viewModes: z.array(z.object({
		mode: z.string().min(1),
		/** i18n key, translated with the list's `translationNs`. */
		label: z.string().min(1),
	}).strict()).min(1).default([{ mode: 'list', label: 'datatable.list' }]),
}).strict();

export type ResourceListV2Props = z.infer<typeof resourceListV2PropsSchema>;
export type ResourceListV2PropsInput = z.input<typeof resourceListV2PropsSchema>;
