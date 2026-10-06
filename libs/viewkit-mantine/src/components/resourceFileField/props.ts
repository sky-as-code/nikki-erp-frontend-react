import { z } from 'zod';


export const resourceFileFieldPropsSchema = z.object({
	field: z.string().min(1),
	urlField: z.string().min(1),
	label: z.string().min(1),
	accept: z.array(z.string().min(1)).default([
		'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
	]),
	maxBytes: z.number().int().positive().default(10 * 1024 * 1024),
}).strict();

export type ResourceFileFieldProps = z.infer<typeof resourceFileFieldPropsSchema>;
export type ResourceFileFieldPropsInput = z.input<typeof resourceFileFieldPropsSchema>;
