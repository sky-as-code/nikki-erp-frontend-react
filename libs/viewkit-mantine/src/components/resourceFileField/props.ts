import { z } from 'zod';


export const resourceFileFieldPropsSchema = z.object({
	/** The field's base name, used in test ids, e.g. `preview_image`. */
	field: z.string().min(1),
	/** The record field holding the stored file's id, e.g. `preview_image_file_id`. */
	fileIdField: z.string().min(1),
	label: z.string().min(1),
	accept: z.array(z.string().min(1)).default([
		'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
	]),
	maxBytes: z.number().int().positive().default(10 * 1024 * 1024),
	/**
	 * A sibling field whose value says what the file is, e.g. `media_type`. With it the picker accepts
	 * `acceptByKind[value]` instead of `accept`, and a `video` kind previews as a video.
	 */
	kindField: z.string().min(1).optional(),
	acceptByKind: z.record(z.string(), z.array(z.string().min(1))).optional(),
	/** i18n keys for the kind-aware picker: no kind chosen yet, and a file of another kind. */
	kindHints: z.object({ pickFirst: z.string().min(1), wrongType: z.string().min(1) }).strict().optional(),
}).strict();

export type ResourceFileFieldProps = z.infer<typeof resourceFileFieldPropsSchema>;
export type ResourceFileFieldPropsInput = z.input<typeof resourceFileFieldPropsSchema>;
