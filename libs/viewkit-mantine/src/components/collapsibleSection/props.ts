import { z } from 'zod';


const baseSchema = z.object({
	/** i18n key for an optional title. The title is what a reader clicks to collapse the block. */
	header: z.string().min(1).optional(),
	/** Namespace `header` is resolved against. Required whenever `header` is set. */
	translationNs: z.string().min(1).optional(),
	/**
	 * Whether the block can be collapsed at all. Defaults to `header !== undefined`: an untitled
	 * block has nothing to click, so it stays a plain bordered block until a header gives the
	 * toggle somewhere to live.
	 */
	collapsible: z.boolean().optional(),
	expanded: z.boolean().default(true),
	transitionDuration: z.number().default(500),
	transitionTimingFunction: z.string().default('ease-in-out'),
}).strict();

/**
 * Split out of the renderer so `@nikkierp/viewkit-mantine/props` can expose a builder for it:
 * that entry point must stay React-free, and the renderer file is not.
 */
export const collapsibleSectionPropsSchema = baseSchema
	.superRefine((val, ctx) => {
		if (val.header != null && val.translationNs == null) {
			ctx.addIssue({
				code: 'custom', path: ['translationNs'],
				message: '`translationNs` is required when `header` is set',
			});
		}
		if (val.header == null && val.translationNs != null) {
			ctx.addIssue({
				code: 'custom', path: ['translationNs'],
				message: '`translationNs` does nothing without a `header`',
			});
		}
		if (val.collapsible === true && val.header == null) {
			ctx.addIssue({
				code: 'custom', path: ['collapsible'],
				message: '`collapsible: true` needs a `header` to host the toggle',
			});
		}
	})
	.transform(val => ({ ...val, collapsible: val.collapsible ?? val.header != null }));

export type CollapsibleSectionProps = z.output<typeof collapsibleSectionPropsSchema>;
export type CollapsibleSectionPropsInput = z.input<typeof collapsibleSectionPropsSchema>;
