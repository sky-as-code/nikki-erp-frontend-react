import { fieldRendererSpecSchema } from '@nikkierp/viewengine/schema';
import { z } from 'zod';


export const resourceListCommandActionSchema = z.object({
	label: z.string().min(1),
	command: z.string().min(1),
	supportMultiple: z.boolean().optional(),
	requireSelection: z.boolean().optional(),
	/** Last segment of this action's `data-testid`. Defaults to its command name. */
	testId: z.string().min(1).optional(),
});

/**
 * `.strict()` is deliberate: with the previous class props a misspelled
 * `archiveComand` was a silently dead action. It now fails validation and the
 * engine renders a visible diagnostic instead.
 */
export const resourceListPropsSchema = z.object({
	schemaName: z.string().min(1),
	translationNs: z.string().min(1),
	searchCommand: z.string().min(1),
	createEnabled: z.boolean().default(false),
	deleteCommand: z.string().min(1).optional(),
	archiveCommand: z.string().min(1).optional(),
	updateSaveCommand: z.string().min(1).optional(),
	extraActions: z.array(resourceListCommandActionSchema).default([]),
	linkField: z.string().min(1).optional(),
	fieldAsId: z.string().min(1).optional(),
	/** Map of field name -> serializable renderer spec, resolved at render time. */
	fieldRenderers: z.record(z.string(), fieldRendererSpecSchema).optional(),
	/**
	 * `{module}.{component}` prefix for the `data-testid` of every element this page renders.
	 * Derived from the route and schema name when omitted, so most pages need not set it.
	 */
	testId: z.string().min(1).optional(),
}).strict();

export type ResourceListProps = z.infer<typeof resourceListPropsSchema>;
export type ResourceListPropsInput = z.input<typeof resourceListPropsSchema>;
export type ResourceListCommandAction = z.infer<typeof resourceListCommandActionSchema>;
