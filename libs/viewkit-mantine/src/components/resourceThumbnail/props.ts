import { z } from 'zod';

import { resourceFileFieldPropsSchema } from '../resourceFileField/props';


/**
 * The photo a detail page shows left of its titles. `field` is the resource's file field — the
 * `:field` of the BFF's `files/:field` route — and `pathField` the stored file's path, displayed
 * through Storage's download URL. `fallbackUrlField` names a plain URL column shown while no file
 * has been uploaded.
 */
export const resourceThumbnailSpecSchema = resourceFileFieldPropsSchema.omit({ label: true }).extend({
	fallbackUrlField: z.string().min(1).optional(),
}).strict();

export type ResourceThumbnailSpec = z.infer<typeof resourceThumbnailSpecSchema>;
export type ResourceThumbnailSpecInput = z.input<typeof resourceThumbnailSpecSchema>;
