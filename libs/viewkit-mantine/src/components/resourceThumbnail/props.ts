import { z } from 'zod';

import { resourceFileFieldPropsSchema } from '../resourceFileField/props';


/**
 * The photo a detail page shows left of its titles. `field` is the file field's base name (test ids)
 * and `fileIdField` the record field holding the stored file's id, displayed through Storage's
 * download URL. While the record has no file of its own, `fallbackFileIdField` (another file id, e.g.
 * a variant's template image) and then `fallbackUrlField` (a plain URL column) are shown instead.
 */
export const resourceThumbnailSpecSchema = resourceFileFieldPropsSchema.omit({ label: true }).extend({
	fallbackFileIdField: z.string().min(1).optional(),
	fallbackUrlField: z.string().min(1).optional(),
}).strict();

export type ResourceThumbnailSpec = z.infer<typeof resourceThumbnailSpecSchema>;
export type ResourceThumbnailSpecInput = z.input<typeof resourceThumbnailSpecSchema>;
