import { z } from 'zod';


/** The strip reads the page's `allStatuses` and `currentStatus` off the update context. */
export const resourceStatusStripPropsSchema = z.object({
	/**
	 * `true` renders the bare flow, for a section header's right segment; `false` (the default) a
	 * full-width row of a `formBlocks` grid.
	 */
	inline: z.boolean().default(false),
}).strict();

export type ResourceStatusStripProps = z.infer<typeof resourceStatusStripPropsSchema>;
export type ResourceStatusStripPropsInput = z.input<typeof resourceStatusStripPropsSchema>;
