import { componentNodeSchema } from '@nikkierp/viewengine/schema';
import { z } from 'zod';


/**
 * One tab: `header` labels it in the `SegmentedControl` and (if `titleVisibility` shows the section
 * title) `key` addresses it, `content` is the block it shows. `header` is an i18n **key**, never a
 * label -- resolved at render time, same as `resourceFormTabSchema`.
 */
export const tabCollapsibleSectionTabSchema = z.object({
	/** Stable identifier. Also the value synced to the `SegmentedControl`, so keep it URL-safe. */
	key: z.string().min(1),
	header: z.string().min(1),
	content: componentNodeSchema,
}).strict();

/**
 * `.strict()`, like every kit props schema: a misspelled key is a visible diagnostic rather than a
 * silently dead tab.
 */
export const tabCollapsibleSectionPropsSchema = z.object({
	tabs: z.array(tabCollapsibleSectionTabSchema).min(1),
	/** Namespace every tab `header` (and the section `header`, if set) is resolved against. */
	translationNs: z.string().min(1),
	/** i18n key for an optional section title. */
	header: z.string().min(1).optional(),
	/**
	 * The `SegmentedControl` block-visibility switch only appears once `tabs.length` exceeds this.
	 * Below the threshold every tab's block renders inline, same as `collapsibleSectionNode({
	 * layout: 'formBlocks' })`.
	 */
	minBlockCountWithoutTabs: z.number().int().positive().default(2),
	/**
	 * Whether the section title is visible. `auto` (the default) shows it only when the
	 * `SegmentedControl` is hidden -- once the control appears, its tab labels already say what the
	 * section holds, so a duplicate title above it would be redundant.
	 */
	titleVisibility: z.enum(['show', 'hide', 'auto']).default('auto'),
	collapsible: z.boolean().optional(),
	expanded: z.boolean().default(true),
	transitionDuration: z.number().default(500),
	transitionTimingFunction: z.string().default('ease-in-out'),
	/**
	 * `{module}.{component}` prefix for the collapse toggle's and `SegmentedControl`'s
	 * `data-testid`s. The `header` key is appended, so several sections on one page stay distinct
	 * without setting this.
	 */
	testId: z.string().min(1).optional(),
}).strict()
	.superRefine((val, ctx) => {
		const keys = val.tabs.map(tab => tab.key);
		if (new Set(keys).size !== keys.length) {
			ctx.addIssue({ code: 'custom', path: ['tabs'], message: 'tab `key` values must be unique' });
		}
		if (val.collapsible === true && val.header == null) {
			ctx.addIssue({
				code: 'custom', path: ['collapsible'],
				message: '`collapsible: true` needs a `header` to host the toggle',
			});
		}
	})
	.transform(val => ({ ...val, collapsible: val.collapsible ?? val.header != null }));

export type TabCollapsibleSectionTab = z.infer<typeof tabCollapsibleSectionTabSchema>;
export type TabCollapsibleSectionProps = z.output<typeof tabCollapsibleSectionPropsSchema>;
export type TabCollapsibleSectionPropsInput = z.input<typeof tabCollapsibleSectionPropsSchema>;
