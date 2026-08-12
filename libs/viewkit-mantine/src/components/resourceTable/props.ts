import { fieldRendererSpecSchema } from '@nikkierp/viewengine/schema';
import { z } from 'zod';


/** Plain-JSON search graph; `${param}` placeholders are resolved at render time. */
const graphValueSchema: z.ZodType<unknown> = z.lazy(() => z.union([
	z.string(),
	z.number(),
	z.boolean(),
	z.null(),
	z.array(graphValueSchema),
	z.record(z.string(), graphValueSchema),
]));

export const filterGraphSchema = z.record(z.string(), graphValueSchema);

/**
 * A toolbar action of the embedded table, rendered by `DataTable` next to Refresh.
 *
 * Two variants, exactly one of which must be set: `command` publishes to the command bus with the
 * selected row ids, `routePath` is a plain link. The link variant exists because the entry points
 * this schema was added for — "manage roles" on a principal's assigned-roles table — navigate to
 * another page rather than mutate the listed records.
 */
export const resourceTableActionSchema = z.object({
	/** i18n key, translated with the table's `translationNs`. */
	label: z.string().min(1),
	command: z.string().min(1).optional(),
	/** Link target, resolved path-relative to the current URL. */
	routePath: z.string().min(1).optional(),
	supportMultiple: z.boolean().optional(),
	requireSelection: z.boolean().optional(),
	/** Last segment of this action's `data-testid`. Defaults to its command name. */
	testId: z.string().min(1).optional(),
}).strict().refine(
	action => Boolean(action.command) !== Boolean(action.routePath),
	{ message: 'exactly one of `command` or `routePath` must be set' },
);

/**
 * A related-records table, embeddable in a resource detail page's `childrenNodes`.
 *
 * Only rendered in update mode: `ResourceDetail` passes `childrenNodes` to
 * `ResourceUpdate` and not to `ResourceCreate`, which is correct — on `/{resource}/new`
 * there is no id yet, so `${id}` would resolve to the literal string `'new'`.
 */
export const resourceTablePropsSchema = z.object({
	schemaName: z.string().min(1),
	translationNs: z.string().min(1),
	searchCommand: z.string().min(1),
	searchName: z.string().min(1).default('default'),
	fields: z.array(z.string().min(1)).optional(),
	pageSize: z.number().int().positive().default(20),
	/**
	 * Search graph applied to every request. Any whole string of the form `${name}`
	 * is replaced with the current route param of that name, e.g.
	 * `{ if: ['roles', 'linked', '${id}'] }` on a role detail page.
	 */
	filterGraph: filterGraphSchema.optional(),
	/** Row field whose value becomes the link's `:id`. */
	linkField: z.string().min(1).optional(),
	/**
	 * Page segment of the *target* page, relative to `/{orgSlug}/{moduleSlug}`.
	 * A users table inside the roles page sets `'users'` → `/{org}/{mod}/users/:id`.
	 */
	linkRoutePath: z.string().min(1).optional(),
	fieldRenderers: z.record(z.string(), fieldRendererSpecSchema).optional(),
	/** Toolbar actions appended after Refresh. */
	extraActions: z.array(resourceTableActionSchema).default([]),
	/**
	 * `{module}.{component}` prefix for the `data-testid` of every element this table renders.
	 * Derived from the schema name when omitted. Set it when a page embeds two tables of the same
	 * schema, which would otherwise collide.
	 */
	testId: z.string().min(1).optional(),
}).strict();

export type ResourceTableProps = z.infer<typeof resourceTablePropsSchema>;
export type ResourceTablePropsInput = z.input<typeof resourceTablePropsSchema>;
export type ResourceTableAction = z.infer<typeof resourceTableActionSchema>;
