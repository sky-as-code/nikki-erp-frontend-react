import { fieldRendererSpecSchema } from '@nikkierp/viewengine/schema';
import { z } from 'zod';

import { filterGraphSchema } from '../../components/resourceTable/props';


export const resourceListCommandActionSchema = z.object({
	label: z.string().min(1),
	command: z.string().min(1),
	supportMultiple: z.boolean().optional(),
	requireSelection: z.boolean().optional(),
	/** Last segment of this action's `data-testid`. Defaults to its command name. */
	testId: z.string().min(1).optional(),
});

/**
 * The backend resolves a `fields=` selection one dot deep — `MaxSelectGraphColumnDots`. Filtering
 * reaches further, but a column has to be selected before it can be shown, so the column form is
 * what this cap applies to. Rejecting it here turns a server-side "field path too deep" into an
 * authoring-time diagnostic naming the offending field.
 */
const MAX_DISPLAYED_FIELD_DOTS = 1;

const displayedFieldPathSchema = z.string().min(1).refine(
	field => (field.split('.').length - 1) <= MAX_DISPLAYED_FIELD_DOTS,
	{ message: 'a displayed field reaches at most one edge deep, e.g. `product_template.name`' },
);

/**
 * A column of the list, either a bare field name or a field paired with its own label.
 *
 * The bare form takes its header from the model schema's per-field label, which the backend
 * already localizes. The object form is for the cases the schema cannot answer: a field reached
 * through an edge, which belongs to the *other* schema and carries that schema's wording, and a
 * column whose heading should read differently here than it does on its own resource.
 */
export const resourceListDisplayedFieldSchema = z.union([
	displayedFieldPathSchema,
	z.object({
		/** Schema field name, or a single-dot path through an edge (`product_template.name`). */
		field: displayedFieldPathSchema,
		/** i18n key, translated with the list's `translationNs`. */
		label: z.string().min(1),
	}).strict(),
]);

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
	/**
	 * Adds the "Import" entry, which navigates to `{routePath}/import`. Off by default because the
	 * backend serves import only for resources on the composable engine; a page switching it on
	 * must also declare the import page (see `resourceImportProps`).
	 */
	importEnabled: z.boolean().default(false),
	deleteCommand: z.string().min(1).optional(),
	archiveCommand: z.string().min(1).optional(),
	updateSaveCommand: z.string().min(1).optional(),
	extraActions: z.array(resourceListCommandActionSchema).default([]),
	/**
	 * The columns to show, in order. Omitted, the server chooses them from the model's
	 * `default_search_fields`, which is what every list did before this prop existed.
	 *
	 * Setting it requests exactly these fields, so it decides both what is fetched and what is
	 * shown. The user's own column choice, saved from the view settings, still outranks it — this
	 * is the page's default view, not a lock.
	 */
	displayed_fields: z.array(resourceListDisplayedFieldSchema).nonempty().optional(),
	linkField: z.string().min(1).optional(),
	fieldAsId: z.string().min(1).optional(),
	/**
	 * Search graph applied to every request, e.g. to give a menu item a second, filtered entry
	 * point into a list its schema would otherwise render unfiltered. Same grammar as
	 * `resourceTable`'s `filterGraph`: a whole-string `${name}` leaf is resolved at render time —
	 * `${today}` to the current date, in addition to any route param.
	 */
	filterGraph: filterGraphSchema.optional(),
	/** Map of field name -> serializable renderer spec, resolved at render time. */
	fieldRenderers: z.record(z.string(), fieldRendererSpecSchema).optional(),
	/**
	 * `{module}.{component}` prefix for the `data-testid` of every element this page renders.
	 * Derived from the route and schema name when omitted, so most pages need not set it.
	 */
	testId: z.string().min(1).optional(),
}).strict();

export type ResourceListProps = z.infer<typeof resourceListPropsSchema>;
export type ResourceListDisplayedField = z.infer<typeof resourceListDisplayedFieldSchema>;
export type ResourceListPropsInput = z.input<typeof resourceListPropsSchema>;
export type ResourceListCommandAction = z.infer<typeof resourceListCommandActionSchema>;
