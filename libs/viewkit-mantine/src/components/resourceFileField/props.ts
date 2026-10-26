import { z } from 'zod';


export const resourceFileFieldPropsSchema = z.object({
	/** The field's base name, the `:field` of the BFF's `files/:field` route. */
	field: z.string().min(1),
	/** The record field holding the stored file's path, e.g. `default_image_file_path`. */
	pathField: z.string().min(1),
	label: z.string().min(1),
	accept: z.array(z.string().min(1)).default([
		'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
	]),
	maxBytes: z.number().int().positive().default(10 * 1024 * 1024),
}).strict();

export type ResourceFileFieldProps = z.infer<typeof resourceFileFieldPropsSchema>;
export type ResourceFileFieldPropsInput = z.input<typeof resourceFileFieldPropsSchema>;
