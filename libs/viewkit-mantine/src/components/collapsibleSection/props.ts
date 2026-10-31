import { componentNodeSchema } from '@nikkierp/viewengine/schema';
import { z } from 'zod';


const baseSchema = z.object({
	/** i18n key for an optional title. The title is what a reader clicks to collapse the block. */
	header: z.string().min(1).optional(),
	/** Namespace `header` is resolved against. Required whenever `header` is set. */
	translationNs: z.string().min(1).optional(),
	/**
	 * Whether the block can be collapsed at all. Defaults to `true`: the toggle caret renders
	 * whether or not `header` is set, so an untitled block can still be collapsed by its caret
	 * alone.
	 */
	collapsible: z.boolean().default(true),
	/**
	 * How the section arranges its children.
	 *
	 * `stack` (the default) leaves them to flow, which is what a section holding a table, a
	 * custom widget or prose wants. `formBlocks` renders the form panel (`FormPanel`): its
	 * `resource_form__column` children become sections, side by side or stacked by the panel's
	 * own width, and their long text fields gather in a Note box below them.
	 */
	layout: z.enum(['stack', 'formBlocks']).default('stack'),
	expanded: z.boolean().default(true),
	transitionDuration: z.number().default(500),
	transitionTimingFunction: z.string().default('ease-in-out'),
	/**
	 * `{module}.{component}` prefix for the collapse toggle's `data-testid`. The `header` key is
	 * appended, so several sections on one page stay distinct without setting this.
	 */
	testId: z.string().min(1).optional(),
	/**
	 * A node shown at the header's right end, outside the collapse toggle (a click on it never
	 * collapses the block): as wide as its content, flush right, and on a line of its own, still flush
	 * right, once it no longer fits beside the title. The detail template puts the status strip here.
	 */
	rightSegment: componentNodeSchema.optional(),
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
	});

export type CollapsibleSectionProps = z.output<typeof collapsibleSectionPropsSchema>;
export type CollapsibleSectionPropsInput = z.input<typeof collapsibleSectionPropsSchema>;
