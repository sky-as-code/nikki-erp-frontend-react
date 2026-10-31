import { componentNodeSchema, conditionExpressionSchema } from '@nikkierp/viewengine/schema';
import { z } from 'zod';


export const schemaFieldSpecSchema = z.object({ schemaField: z.string().min(1) });
export const linkSpecSchema = z.object({ linkHref: z.string() });

/**
 * One step of a detail page's status flow. No colour: the flow marks only the current step, in the
 * primary colour; status colours belong to the list's badges.
 */
export const statusOptionSchema = z.object({
	value: z.string(),
	label: z.string(),
	/** A state reached instead of finishing the flow (cancelled, rejected, …): shown apart from the steps. */
	alternativeEnd: z.boolean().optional(),
});

export const ownPropertySectionSchema = z.object({
	/**
	 * Optional i18n key for the block's title. A block that is already introduced by its
	 * enclosing `collapsible_section` header has nothing left to say, so it omits this rather
	 * than passing an empty string -- which used to resolve through `t('')` and print the raw
	 * namespace.
	 */
	header: z.string().min(1).optional(),
	/**
	 * Field names, top to bottom. A nested array is one inline row: `$$ns:key` / `$$key` renders
	 * translated text (namespace defaults to the page's `translationNs`), `@@field` renders that
	 * field's input (its value in read mode), anything else renders as literal text.
	 */
	fields: z.array(z.union([z.string(), z.array(z.string())])).optional(),
	/**
	 * Whether `header` also prints above the block's fields. Defaults to `false`: a block used as a
	 * `tabCollapsibleSection` tab already shows its title in the tab control, so printing it again
	 * inside the block would be redundant.
	 */
	showTitle: z.boolean().default(true),
	/**
	 * Whether the block shares a row of the form panel with its neighbours (the default). `false`
	 * gives it a row of its own, its fields spread across that row.
	 */
	isFluid: z.boolean().default(true),
	/** Whether the panel draws the separator between this block and the one before it. Defaults to `true`. */
	showSeparator: z.boolean().default(true),
	/**
	 * v2 only. Fields the record itself says may no longer change: in update mode `field` renders as a
	 * disabled input with `hint` (an i18n key in the page's namespace) under it whenever the record's
	 * boolean `unless` is `false`. Locked, never hidden; the server enforces the rule either way.
	 */
	lockedFields: z.record(z.string(), z.object({
		unless: z.string().min(1),
		hint: z.string().min(1),
	}).strict()).optional(),
	/**
	 * v2 only. Fields this page never edits although the schema allows it, because another page
	 * owns the change: in update mode they render as read-only text, like a server-owned field.
	 */
	readOnlyFields: z.array(z.string()).optional(),
	/**
	 * v2 only. Fields shown only while a condition on the record holds: `{ field: condition }`, where
	 * a list of conditions must all hold. Read mode tests the record; update and create test the live
	 * form, so a field appears the moment the value it depends on changes. Applies to `@@field` items
	 * of inline rows too. Hiding is presentation only: a hidden field keeps its value.
	 */
	visibleWhen: z.record(
		z.string(),
		z.union([conditionExpressionSchema, z.array(conditionExpressionSchema).min(1)]),
	).optional(),
	/**
	 * v2 only. Narrows a relation select of this block: `{ field: { searchField?, matchFormFields? } }`.
	 * `searchField` is the target-schema field the typed term matches instead of its record label
	 * (needed when that label is a `function` computed field). `matchFormFields` is
	 * `{ targetField: formField }`: while the form's `formField` holds a value, only target records
	 * whose `targetField` equals it are offered; an empty source narrows nothing. Presentation only:
	 * the server validates the reference either way.
	 */
	relationSearch: z.record(z.string(), z.object({
		searchField: z.string().min(1).optional(),
		matchFormFields: z.record(z.string(), z.string().min(1)).optional(),
	}).strict()).optional(),
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
	/**
	 * The backend action code this entry performs, or a `routePath` leads to, when no command verb names it
	 * (`confirm`, `do_scrap`, `create_return`). Copy it from the application service's
	 * `AssertAction` call; it is what the entitlement lock checks. Absent means derived.
	 */
	actionCode: z.string().min(1).optional(),
	/**
	 * Renders a registered component in the button's place instead of publishing or navigating: the
	 * contribution id of a view-kit component renderer, given `{label}` (this entry's `label`,
	 * translated). For an action that needs more than a command and a prompt -- its own dialog fed
	 * from the record -- while staying placed with the page's other actions. The component reads the
	 * record from the update context, locks itself on what it asserts, and hides itself where it must
	 * (update mode, for one that leaves the page or reads the saved record).
	 */
	component: z.string().min(1).optional(),
	condition: conditionExpressionSchema.optional(),
	/**
	 * When present the button opens a dialog collecting these fields, and the
	 * collected values are merged into the `{id, etag}` request. Absent means
	 * fire immediately, which is what every existing action does.
	 */
	prompt: actionPromptSchema.optional(),
	/** An i18n key shown as a success notice once the command succeeds. */
	successNotice: z.string().min(1).optional(),
	/**
	 * The command creates another record of this resource (a copy): on success the page opens it,
	 * at `../{id}` of the command's result, instead of refreshing the current one.
	 */
	openResult: z.boolean().optional(),
}).strict().refine(
	action => [action.command, action.routePath, action.component].filter(Boolean).length === 1,
	{ message: 'Exactly one of `command`, `routePath` or `component` is required' },
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
	backLinkTitle: linkSpecSchema.optional(),
	allStatuses: z.array(statusOptionSchema).optional(),
	currentStatus: schemaFieldSpecSchema.optional(),
	contextualActions: z.record(z.string(), resourceDetailExtraActionSchema).optional(),
	standardActionCommands: standardActionCommandsSchema.default({}),
	/**
	 * Extra component nodes rendered after the detail form, as its siblings.
	 * Update mode only — `ResourceCreate` is not given them, which is correct:
	 * during create there is no record id for a related-records table to filter by.
	 */
	childrenNodes: z.array(componentNodeSchema).optional(),
	/**
	 * Component nodes rendered as the create form's body.
	 *
	 * Separate from `childrenNodes` because the two modes genuinely differ: `childrenNodes` may
	 * hold related-records tables, which have no record id to filter by during create. A page's
	 * own field blocks belong in both, and the same `resourceFormColumnNode` serves either -- it
	 * detects the mode from its enclosing form. A page with no `create` command needs neither.
	 */
	createNodes: z.array(componentNodeSchema).optional(),
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
export type OwnPropertySectionInput = z.input<typeof ownPropertySectionSchema>;
export type ActionPromptField = z.infer<typeof actionPromptFieldSchema>;
export type ActionPrompt = z.infer<typeof actionPromptSchema>;
export type ResourceDetailExtraAction = z.infer<typeof resourceDetailExtraActionSchema>;
export type ResourceDetailContextualActions = Record<string, ResourceDetailExtraAction>;
export type ResourceDetailStandardActionCommands = z.infer<typeof standardActionCommandsSchema>;
