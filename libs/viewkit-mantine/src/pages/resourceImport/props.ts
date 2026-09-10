import { z } from 'zod';


/**
 * `.strict()` like the other page templates: a misspelled key fails where the page is authored
 * rather than rendering a wizard that silently ignores it.
 */
export const resourceImportPropsSchema = z.object({
	schemaName: z.string().min(1),
	/** Namespace for the page's own labels; field labels come from the schema itself. */
	translationNs: z.string().min(1).default('common'),
	/**
	 * Route of the list page the summary links back to, e.g. `product_categories`. The import
	 * page itself is declared at `{returnRoutePath}/import` by the module.
	 */
	returnRoutePath: z.string().min(1),
	/**
	 * `{module}.{component}` prefix for the `data-testid` of every element this page renders.
	 * Derived from the route and schema name when omitted.
	 */
	testId: z.string().min(1).optional(),
}).strict();

export type ResourceImportProps = z.infer<typeof resourceImportPropsSchema>;
export type ResourceImportPropsInput = z.input<typeof resourceImportPropsSchema>;
