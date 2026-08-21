import { componentNodeSchema, conditionExpressionSchema } from '@nikkierp/viewengine/schema';
import { z } from 'zod';


export const schemaFieldSpecSchema = z.object({ schemaField: z.string().min(1) });
export const linkSpecSchema = z.object({ linkHref: z.string() });

export const statusOptionSchema = z.object({
	value: z.string(),
	label: z.string(),
	color: z.string(),
});

export const ownPropertySectionSchema = z.object({
	header: z.string(),
	fields: z.array(z.string()).optional(),
});

/**
 * Contextual action driven by a command name. `condition` is a serializable
 * expression rather than a predicate function.
 *
 * The old `buildRequest?: (resource) => unknown` escape hatch is gone: it was a
 * function in what is supposed to be metadata, and no page ever supplied one --
 * every call site fell through to the default request builder.
 */
/**
 * One field a contextual action collects before it fires.
 *
 * `name` refers to a field on the page's own `schemaName`, so the dialog
 * inherits its label, data type, validation and renderer. Declaring the field
 * inline instead would duplicate all four and drift the moment the backend
 * schema changed.
 */
export const actionPromptFieldSchema = z.object({
	name: z.string().min(1),
	/** Overrides the schema's required-ness, for this prompt only. */
	required: z.boolean().optional(),
	/** Prefills from this field of the current record. Omit for a blank input. */
	defaultFromField: z.string().min(1).optional(),
});

/**
 * A dialog a contextual action opens to collect values before publishing.
 *
 * Flat scalar fields only. An action needing a variable-length list -- a
 * per-line grid, say -- is not this feature: it wants a component of its own
 * under `childrenNodes`, because rows seeded from another resource need a
 * search command and per-row validation that no generic spec can express.
 */
export const actionPromptSchema = z.object({
	/** Translation key for the dialog heading. */
	title: z.string().min(1),
	fields: z.array(actionPromptFieldSchema).min(1),
	/** Translation key for the confirm button; defaults to the action's own `label`. */
	submitLabel: z.string().min(1).optional(),
}).strict();

export const resourceDetailExtraActionSchema = z.object({
	label: z.string().min(1),
	command: z.string().min(1).optional(),
	/**
	 * Navigates instead of publishing: the `routePath` of the target **page**, as its
	 * `definePage` registers it, with `:param` tokens filled from the current route.
	 *
	 * A page whose content belongs to the record but is too big to sit inside the detail --
	 * a shelf grid, an assignment wizard -- is reached this way rather than by a command,
	 * which has nowhere to navigate to. Mutually exclusive with `command`, the same union
	 * `resourceTable`'s actions already use.
	 */
	routePath: z.string().min(1).optional(),
	condition: conditionExpressionSchema.optional(),
	/**
	 * When present the button opens a dialog collecting these fields, and the
	 * collected values are merged into the `{id, etag}` request. Absent means
	 * fire immediately, which is what every existing action does.
	 */
	prompt: actionPromptSchema.optional(),
}).strict().refine(
	action => Boolean(action.command) !== Boolean(action.routePath),
	{ message: 'Exactly one of `command` or `routePath` is required' },
).refine(
	action => !action.prompt || Boolean(action.command),
	{ message: '`prompt` collects values for a command, so it needs one', path: ['prompt'] },
);

/** Command names for standard CRUD actions, resolved by the owning module. */
export const standardActionCommandsSchema = z.object({
	getById: z.string().min(1).optional(),
	create: z.string().min(1).optional(),
	update: z.string().min(1).optional(),
	delete: z.string().min(1).optional(),
	archive: z.string().min(1).optional(),
});

export const resourceDetailPropsSchema = z.object({
	schemaName: z.string().min(1),
	translationNs: z.string().min(1),
	titleLvl1: schemaFieldSpecSchema.optional(),
	titleLvl2: schemaFieldSpecSchema.optional(),
	titleLvl3: linkSpecSchema.optional(),
	allStatuses: z.array(statusOptionSchema).optional(),
	currentStatus: schemaFieldSpecSchema.optional(),
	formSections: z.array(ownPropertySectionSchema).default([]),
	contextualActions: z.record(z.string(), resourceDetailExtraActionSchema).optional(),
	standardActionCommands: standardActionCommandsSchema.default({}),
	/**
	 * Extra component nodes rendered after the detail form, as its siblings.
	 * Update mode only — `ResourceCreate` is not given them, which is correct:
	 * during create there is no record id for a related-records table to filter by.
	 */
	childrenNodes: z.array(componentNodeSchema).optional(),
	/**
	 * `{module}.{component}` prefix for the `data-testid` of every element this page renders.
	 * Derived from the route and schema name when omitted, so most pages need not set it.
	 */
	testId: z.string().min(1).optional(),
}).strict();

export type ResourceDetailProps = z.infer<typeof resourceDetailPropsSchema>;
export type ResourceDetailPropsInput = z.input<typeof resourceDetailPropsSchema>;
export type SchemaFieldSpec = z.infer<typeof schemaFieldSpecSchema>;
export type LinkSpec = z.infer<typeof linkSpecSchema>;
export type StatusOption = z.infer<typeof statusOptionSchema>;
export type OwnPropertySection = z.infer<typeof ownPropertySectionSchema>;
export type ActionPromptField = z.infer<typeof actionPromptFieldSchema>;
export type ActionPrompt = z.infer<typeof actionPromptSchema>;
export type ResourceDetailExtraAction = z.infer<typeof resourceDetailExtraActionSchema>;
export type ResourceDetailContextualActions = Record<string, ResourceDetailExtraAction>;
export type ResourceDetailStandardActionCommands = z.infer<typeof standardActionCommandsSchema>;
