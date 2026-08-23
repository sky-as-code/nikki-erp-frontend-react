import { describe, expect, it } from 'vitest';

import { buildSavePayload } from './settingsSaveBar';

import type { SettingItemData, SettingsDataContextValue } from './settingsDataContext';


function item(over: Partial<SettingItemData> = {}): SettingItemData {
	return {
		name: 'timezone', level: 'user', value: 'Europe/London',
		has_value: true, allow_override: true, editable: true,
		field: { name: 'timezone', data_type: { name: 'string' } },
		...over,
	} as SettingItemData;
}

function data(over: Partial<SettingsDataContextValue> = {}): SettingsDataContextValue {
	return {
		items: new Map([
			['user:timezone', item()],
			['user:language', item({ name: 'language', value: 'en-US' })],
			['org:default_currency', item({ name: 'default_currency', level: 'org', value: 'EUR' })],
		]),
		drafts: new Map(),
		setDraft: () => {},
		overrideDrafts: new Map(),
		setOverrideDraft: () => {},
		ownerType: null,
		isLoading: false,
		loadError: null,
		...over,
	} as SettingsDataContextValue;
}

describe('buildSavePayload', () => {
	it('sends only the settings the user touched', () => {
		// The point of the partial save: writes are last-write-wins with no version check, so an
		// untouched item in the body would clobber someone else's concurrent edit.
		const payload = buildSavePayload(data({
			drafts: new Map([['user:timezone', 'Europe/Paris']]),
		}));

		expect([...payload.keys()]).toEqual(['user']);
		expect(payload.get('user')).toEqual([{ name: 'timezone', value: 'Europe/Paris' }]);
	});

	it('groups items by level, one bucket per endpoint', () => {
		const payload = buildSavePayload(data({
			drafts: new Map<string, unknown>([
				['user:timezone', 'Europe/Paris'],
				['org:default_currency', 'USD'],
			]),
		}));

		expect(payload.get('user')).toEqual([{ name: 'timezone', value: 'Europe/Paris' }]);
		expect(payload.get('org')).toEqual([{ name: 'default_currency', value: 'USD' }]);
	});

	it('omits allow_override when only the value changed', () => {
		// Sending the flag unasked would stamp a fallback into a real decision on the record.
		const payload = buildSavePayload(data({
			drafts: new Map([['user:timezone', 'Europe/Paris']]),
		}));

		expect(payload.get('user')![0]).not.toHaveProperty('allow_override');
	});

	it('merges a value edit and a policy edit into one item', () => {
		// Two columns of the same row. As two items the second would overwrite the first.
		const payload = buildSavePayload(data({
			drafts: new Map([['user:timezone', 'Europe/Paris']]),
			overrideDrafts: new Map([['user:timezone', false]]),
		}));

		expect(payload.get('user')).toEqual([
			{ name: 'timezone', value: 'Europe/Paris', allow_override: false },
		]);
	});

	it('resends the stored value for a policy-only edit', () => {
		// The write is an upsert of one row: the flag needs a value to attach to, so the
		// displayed value goes back unchanged rather than being omitted.
		const payload = buildSavePayload(data({
			overrideDrafts: new Map([['user:timezone', false]]),
		}));

		expect(payload.get('user')).toEqual([
			{ name: 'timezone', value: 'Europe/London', allow_override: false },
		]);
	});

	it('keeps a name containing the level separator intact', () => {
		// Keys are `{level}:{name}` and split on the *first* colon only, so a name that itself
		// contains one must survive the round trip rather than being truncated.
		const payload = buildSavePayload(data({
			items: new Map([['user:a:b', item({ name: 'a:b', value: 1 })]]),
			drafts: new Map([['user:a:b', 2]]),
		}));

		expect(payload.get('user')).toEqual([{ name: 'a:b', value: 2 }]);
	});
});
