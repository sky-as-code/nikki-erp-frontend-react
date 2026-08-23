import { z } from 'zod';


/**
 * Where a title line gets its text.
 *
 * Both arms are `.strict()` so the union discriminates on shape alone — a spec carrying both
 * keys is a mistake, not a fallback chain, and must surface as a diagnostic.
 */
export const pageHeaderTitleSpecSchema = z.union([
	/** Value of a field on the record supplied by `PageHeaderProvider`. */
	z.object({ schemaField: z.string().min(1) }).strict(),
	/** i18n key, interpolated with the provider's `titleParams`. */
	z.object({ textKey: z.string().min(1) }).strict(),
]);

export const pageHeaderLinkSpecSchema = z.object({
	linkHref: z.string(),
	/**
	 * i18n key for the link text. Defaults to the plural label of the provider's model schema,
	 * which is what a resource detail page wants ("< Users").
	 */
	textKey: z.string().min(1).optional(),
}).strict();

export const pageHeaderPropsSchema = z.object({
	titleLvl1: pageHeaderTitleSpecSchema.optional(),
	titleLvl2: pageHeaderTitleSpecSchema.optional(),
	backLinkTitle: pageHeaderLinkSpecSchema.optional(),
}).strict();

export type PageHeaderTitleSpec = z.infer<typeof pageHeaderTitleSpecSchema>;
export type PageHeaderLinkSpec = z.infer<typeof pageHeaderLinkSpecSchema>;
export type PageHeaderProps = z.infer<typeof pageHeaderPropsSchema>;
export type PageHeaderPropsInput = z.input<typeof pageHeaderPropsSchema>;
