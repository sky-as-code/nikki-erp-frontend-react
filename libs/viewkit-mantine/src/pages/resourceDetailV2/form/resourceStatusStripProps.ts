import { z } from 'zod';


/** No options: the strip reads the page's `allStatuses` and `currentStatus` off the update context. */
export const resourceStatusStripPropsSchema = z.object({}).strict();

export type ResourceStatusStripProps = z.infer<typeof resourceStatusStripPropsSchema>;
export type ResourceStatusStripPropsInput = z.input<typeof resourceStatusStripPropsSchema>;
