import { settingsItemNode, settingsSectionNode } from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * The settings Essential exposes for configuration, as plain metadata.
 *
 * This list *is* the visibility rule. The backend declares more than one schema for this module
 * -- a user-level one and an org-level one -- and a setting that is registered there but not
 * listed here does not render. That is deliberate: a module can ship a setting before it is
 * ready to be configured, and the frontend decides when it becomes visible.
 *
 * Names must match the backend's verbatim (`essential/domain/models/user_settings.go`); the API
 * rejects an unknown setting name rather than storing it.
 */
export function buildEssentialSettingsNodes(): ComponentNode[] {
	return [
		// One section per level. The heading is the level's own -- "User settings",
		// "Organization settings" -- so this module does not name them.
		settingsSectionNode({
			level: 'user',
			translationNs: c.ESSENTIAL_MODULE,
			children: [
				settingsItemNode({ name: 'theme_mode', labelKey: 'settings.themeMode' }),
				settingsItemNode({ name: 'language', labelKey: 'settings.language' }),
				settingsItemNode({ name: 'timezone', labelKey: 'settings.timezone' }),
			],
		}),
		settingsSectionNode({
			level: 'org',
			translationNs: c.ESSENTIAL_MODULE,
			children: [
				settingsItemNode({ name: 'system_locale', labelKey: 'settings.systemLocale' }),
				settingsItemNode({ name: 'system_timezone', labelKey: 'settings.systemTimezone' }),
				settingsItemNode({ name: 'default_currency', labelKey: 'settings.defaultCurrency' }),
			],
		}),
	];
}
