import { z } from 'zod';


/**
 * One tab. `header` is an i18n **key**, never a label: the page definition is authored long before
 * any namespace is guaranteed loaded, so the renderer translates at render time.
 */
export const resourceFormTabSchema = z.object({
	/** Stable identifier. Also the value synced to the URL, so keep it URL-safe and stable. */
	key: z.string().min(1),
	header: z.string().min(1),
}).strict();

/**
 * `.strict()`, like every kit props schema: a misspelled key is a visible diagnostic rather than a
 * silently dead tab.
 */
export const resourceFormTabsPropsSchema = z.object({
	tabs: z.array(resourceFormTabSchema).min(1),
	/** Namespace every `header` is resolved against. */
	translationNs: z.string().min(1),
	/** Tab shown first. Defaults to the first entry of `tabs`. */
	defaultTab: z.string().min(1).optional(),
	/**
	 * `{module}.{component}` prefix for each tab control's `data-testid`. The tab `key` is
	 * appended, so several tab sets on one page stay distinct without setting this.
	 */
	testId: z.string().min(1).optional(),
}).strict().superRefine((val, ctx) => {
	const keys = val.tabs.map(tab => tab.key);
	if (new Set(keys).size !== keys.length) {
		ctx.addIssue({ code: 'custom', path: ['tabs'], message: 'tab `key` values must be unique' });
	}
	if (val.defaultTab != null && !keys.includes(val.defaultTab)) {
		ctx.addIssue({
			code: 'custom', path: ['defaultTab'],
			message: `\`defaultTab\` must name one of the tabs: ${keys.join(', ')}`,
		});
	}
});

export type ResourceFormTab = z.infer<typeof resourceFormTabSchema>;
export type ResourceFormTabsProps = z.output<typeof resourceFormTabsPropsSchema>;
export type ResourceFormTabsPropsInput = z.input<typeof resourceFormTabsPropsSchema>;
