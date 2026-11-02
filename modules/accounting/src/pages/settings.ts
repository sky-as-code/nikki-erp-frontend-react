import { settingsItemNode, settingsSectionNode } from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/** The currency list the system currency picks from, mounted by Settings; see `settings/src/bootstrap/essential.ts`. */
const MANAGE_CURRENCIES_LINK = {
	labelKey: 'accounting.settings.manageCurrencies',
	moduleSlug: 'settings',
	path: 'essential/essential_currency',
};

/**
 * The settings Accounting exposes for configuration, as plain metadata. The system currency is one
 * question asked at two levels, so it has two backend names (`tenant_system_currency`,
 * `system_currency`): a setting name is unique across a module's levels. The organization's own
 * value wins; an empty one falls back to the tenant's.
 *
 * Names must match the backend's verbatim (`accounting/domain/settings/*_settings.go`).
 */
export function buildAccountingSettingsNodes(): ComponentNode[] {
	return [
		settingsSectionNode({
			level: 'tenant',
			translationNs: c.ACCOUNTING_MODULE,
			children: [
				settingsItemNode({
					name: 'tenant_system_currency',
					labelKey: 'accounting.settings.systemCurrency',
					link: MANAGE_CURRENCIES_LINK,
				}),
			],
		}),
		settingsSectionNode({
			level: 'org',
			translationNs: c.ACCOUNTING_MODULE,
			children: [
				settingsItemNode({
					name: 'system_currency',
					labelKey: 'accounting.settings.systemCurrency',
					link: MANAGE_CURRENCIES_LINK,
				}),
			],
		}),
	];
}
