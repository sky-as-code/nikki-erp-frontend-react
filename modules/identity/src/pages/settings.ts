import { settingsItemNode, settingsSectionNode } from '@nikkierp/viewkit-mantine/props';

import * as c from '../constants';

import type { ComponentNode } from '@nikkierp/viewengine/metadata';


/**
 * The settings iam exposes for configuration, as plain metadata.
 *
 * This list *is* the visibility rule: a setting registered on the backend but not named here does
 * not render. Both of these are tenant-level, because a session timeout and an MFA requirement are
 * decisions a tenant makes for everyone in it rather than personal preferences -- which is also
 * why neither allows override, and why both arrive with `editable: false` for anyone below the
 * tenant.
 *
 * Names must match the backend's verbatim (`iam/domain/models/tenant_settings.go`); the API
 * rejects an unknown setting name rather than storing it.
 */
export function buildIamSettingsNodes(): ComponentNode[] {
	return [
		settingsSectionNode({
			level: 'tenant',
			translationNs: c.IAM_MODULE,
			children: [
				settingsItemNode({
					name: 'session_timeout_minutes',
					// Prefixed, unlike Essential's bare keys: this is the key the backend's
					// `Label(NewLangJsonRef(...))` already declares, and the two must agree.
					labelKey: 'iam.settings.sessionTimeoutMinutes',
				}),
				settingsItemNode({ name: 'require_mfa', labelKey: 'iam.settings.requireMfa' }),
			],
		}),
	];
}
