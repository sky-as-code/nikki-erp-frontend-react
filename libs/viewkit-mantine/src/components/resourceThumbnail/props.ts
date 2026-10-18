import { z } from 'zod';

import { resourceFileFieldPropsSchema } from '../resourceFileField/props';


/**
 * The photo a detail page shows left of its titles. `field` is the resource's file field — the
 * `:field` of its `:id/files/:field` routes — and `urlField` the presigned URL the server adds on
 * read. `fallbackUrlField` names a plain URL column shown while no file has been uploaded.
 */
export const resourceThumbnailSpecSchema = resourceFileFieldPropsSchema.omit({ label: true }).extend({
	fallbackUrlField: z.string().min(1).optional(),
}).strict();

export type ResourceThumbnailSpec = z.infer<typeof resourceThumbnailSpecSchema>;
export type ResourceThumbnailSpecInput = z.input<typeof resourceThumbnailSpecSchema>;
