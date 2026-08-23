import { defineTemplateRef } from '@nikkierp/viewengine/metadata';
import { z } from 'zod';

import { SETTINGS_PAGE_TEMPLATE } from './ids';

import type { TemplateRef } from '@nikkierp/viewengine/metadata';


/**
 * One entry in the left rail: a micro-app to configure, and how to label it.
 *
 * This is authored data rather than something discovered at runtime. `MicroAppMetadata` carries
 * no declaration of the widgets a module exposes and `MicroAppManager` has no enumeration API,
 * so there is nothing to ask -- and asking would be the wrong shape anyway: mounting a widget
 * downloads and initialises its whole module, so probing every registered app to find which ones
 * answer would load all of them to render one pane.
 */
export const settingsPanePropsSchema = z.object({
	/** Micro-app slug. Must match the `slug` in the host app's `MicroAppMetadata`. */
	slug: z.string().min(1),
	/**
	 * i18n key for the rail entry, resolved against this page's `translationNs`.
	 *
	 * The rail is labelled from here rather than from the widget because the label has to render
	 * before the widget is mounted -- that is the whole point of a rail. The pane's own heading
	 * comes from the widget's section title, which is why Essential's rail entry and its section
	 * heading both read "General" rather than "Essential".
	 */
	labelKey: z.string().min(1),
}).strict();

/**
 * Authoring surface for the settings kit. Deliberately React-free, like
 * `@nikkierp/viewkit-mantine/props`: a page definition is plain JSON that must survive a bundle
 * boundary, so it may not pull components in. The builder parses eagerly so a bad page fails
 * where it is authored rather than at render time.
 */
export const settingsPagePropsSchema = z.object({
	translationNs: z.string().min(1),
	/** i18n key for the level-1 page title. */
	titleKey: z.string().min(1),
	/** Shown in the right pane when no pane is active -- only reachable if `panes` is empty. */
	emptyKey: z.string().min(1),
	/**
	 * The named widget each module exposes for its settings pane. One key for every entry, since
	 * the contract is the name alone: a consumer names a slug and this string, never an import.
	 */
	widgetName: z.string().min(1),
	/**
	 * The rail, in display order. The first entry is the one active on arrival.
	 *
	 * Listing a module here is the deliberate second half of exposing the widget: the module
	 * declares `pages.settings`, and this list decides whether -- and in what order -- a user
	 * sees it. A module with nothing to show simply does not appear.
	 */
	panes: z.array(settingsPanePropsSchema).min(1),
}).strict();

export type SettingsPaneProps = z.infer<typeof settingsPanePropsSchema>;
export type SettingsPageProps = z.infer<typeof settingsPagePropsSchema>;
export type SettingsPagePropsInput = z.input<typeof settingsPagePropsSchema>;

export function settingsPageProps(input: SettingsPagePropsInput): TemplateRef<SettingsPageProps> {
	return defineTemplateRef(SETTINGS_PAGE_TEMPLATE, settingsPagePropsSchema.parse(input));
}

export * from './ids';
