import { describe, expect, it } from 'vitest';

import { lockReasonKey } from './settingsItem';

import type { SettingItemData } from './settingsDataContext';


function item(overrides: Partial<SettingItemData>): SettingItemData {
	return {
		name: 'x', level: 'user', value: null,
		has_value: false, allow_override: true, editable: true,
		...overrides,
	};
}

/**
 * The backend reports one `editable` boolean computed from two unrelated causes
 * (`settings_read_domservice.go`, `isEditable`). Captioning both the same way tells an
 * organization admin that a tenant policy locked a user-level setting, when in truth the setting
 * simply is not theirs to edit.
 */
describe('lockReasonKey', () => {
	it('is null when the item is editable', () => {
		expect(lockReasonKey(item({ editable: true }))).toBeNull();
	});

	it('blames the tenant only when override is forbidden', () => {
		expect(lockReasonKey(item({ editable: false, allow_override: false })))
			.toBe('settings.enforcedByTenant');
	});

	it('reports a plain scope mismatch when override is allowed', () => {
		// editable=false with allow_override=true can only mean `level !== ownerType`.
		expect(lockReasonKey(item({ editable: false, allow_override: true })))
			.toBe('settings.notEditable');
	});
});
