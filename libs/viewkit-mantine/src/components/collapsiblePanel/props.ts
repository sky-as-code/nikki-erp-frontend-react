import { z } from 'zod';


/**
 * `.strict()`, like every other props schema in this kit: a misspelled key must
 * render a visible diagnostic rather than silently doing nothing.
 */
export const collapsiblePanelPropsSchema = z.object({
	/** i18n key for the panel header. */
	header: z.string().min(1),
	/** Namespace `header` is resolved against. */
	translationNs: z.string().min(1),
	expanded: z.boolean().default(true),
	transitionDuration: z.number().default(500),
	transitionTimingFunction: z.string().default('ease-in-out'),
}).strict();

export type CollapsiblePanelProps = z.infer<typeof collapsiblePanelPropsSchema>;
export type CollapsiblePanelPropsInput = z.input<typeof collapsiblePanelPropsSchema>;
