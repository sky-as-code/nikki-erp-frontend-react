import { z } from 'zod';


/**
 * Which owner a setting belongs to. Mirrors the backend's three levels verbatim -- the value is
 * sent as-is on the settings API's path, so a name invented here would 404 rather than fail
 * validation.
 */
export const settingLevelSchema = z.enum(['tenant', 'org', 'user']);

export type SettingLevel = z.infer<typeof settingLevelSchema>;

export const settingsSectionPropsSchema = z.object({
	/**
	 * Which level this block holds.
	 *
	 * The organizing key of the pane, not a label: the three levels are a property of the settings
	 * model, and every module's pane must separate them the same way and name them the same way.
	 * The heading text comes from the level, so a module cannot call the organization block
	 * something of its own invention -- Essential's org settings and iam's org settings say
	 * "Organization settings" in both panes, translated once.
	 */
	level: settingLevelSchema,
	/**
	 * i18n key for an optional sub-heading *within* the level.
	 *
	 * Only for a module that groups its own items further; the level heading is rendered either
	 * way. Left unset by a module that exposes one plain list per level.
	 */
	titleKey: z.string().min(1).optional(),
	/** i18n key for an optional sentence under the title. */
	descriptionKey: z.string().min(1).optional(),
	/**
	 * Namespace both keys resolve against. Declared once here rather than per item, the same way
	 * a resource page declares it once on the template.
	 */
	translationNs: z.string().min(1),
}).strict();

export type SettingsSectionProps = z.output<typeof settingsSectionPropsSchema>;
export type SettingsSectionPropsInput = z.input<typeof settingsSectionPropsSchema>;

export const settingsItemPropsSchema = z.object({
	/**
	 * The setting name, byte-identical to the backend's. It is the key the value is read and
	 * written under; a drifted name is rejected by the API as an unknown setting rather than
	 * silently stored.
	 */
	name: z.string().min(1),
	/** i18n key for the item's label, resolved against the section's namespace. */
	labelKey: z.string().min(1),
	/**
	 * i18n key for the explanatory sentence shown under the label.
	 *
	 * The backend declares the same sentence as a `$ref` keyed `settings_desc.<name>`, so leaving
	 * this unset falls back to that convention rather than to nothing.
	 */
	descriptionKey: z.string().min(1).optional(),
	/**
	 * A field-renderer spec name (`'badge'`, `'translated'`, ...), not a contribution id -- field
	 * renderers are registered under bare names. Omit it to let the control follow the setting's
	 * declared data type.
	 */
	renderer: z.string().min(1).optional(),
}).strict();

export type SettingsItemProps = z.output<typeof settingsItemPropsSchema>;
export type SettingsItemPropsInput = z.input<typeof settingsItemPropsSchema>;
