import { z } from 'zod';

import { pageHeaderLinkSpecSchema, pageHeaderTitleSpecSchema } from '../../components/pageHeader/props';


/**
 * `.strict()` like the other page templates: a misspelled key fails where the page is authored
 * rather than rendering a page that silently ignores it.
 */
export const resourceGenericPagePropsSchema = z.object({
	/** Resource this page belongs to. Its schema supplies the back link's label. */
	schemaName: z.string().min(1),
	/** Namespace the page's own title and header keys resolve against. */
	translationNs: z.string().min(1).default('common'),
	titleLvl1: pageHeaderTitleSpecSchema.optional(),
	/** Interpolation values for `{ textKey }` titles, e.g. the resource name in a page title. */
	titleParams: z.record(z.string(), z.string()).optional(),
	titleLvl2: pageHeaderTitleSpecSchema.optional(),
	/**
	 * Link back to the resource's listing page. Defaults to the schema's plural label, so a page
	 * gets "< Products" without naming the resource twice.
	 */
	backLinkTitle: pageHeaderLinkSpecSchema.optional(),
	/**
	 * `{module}.{component}` prefix for the `data-testid` of every element this page renders.
	 * Derived from the route and schema name when omitted.
	 */
	testId: z.string().min(1).optional(),
}).strict();

export type ResourceGenericPageProps = z.infer<typeof resourceGenericPagePropsSchema>;
export type ResourceGenericPagePropsInput = z.input<typeof resourceGenericPagePropsSchema>;
