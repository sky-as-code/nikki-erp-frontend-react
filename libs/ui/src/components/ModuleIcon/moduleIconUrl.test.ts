import { describe, expect, it } from 'vitest';

import { GENERIC_MODULE_ICON_URL, getModuleIconUrl } from './moduleIconUrl';


// Vite inlines small SVGs as data: URIs, so the file is identified by its unique gradient id.
function iconId(url: string): string | undefined {
	return /id='g-([a-z-]+)'/.exec(decodeURIComponent(url))?.[1] ?? /([a-z-]+)\.svg/.exec(url)?.[1];
}

describe('getModuleIconUrl', () => {
	it('resolves an icon named after the backend module', () => {
		expect(iconId(getModuleIconUrl('vendingmachine'))).toBe('vendingmachine');
		expect(iconId(getModuleIconUrl('iam'))).toBe('iam');
	});

	it('falls back to the generic icon for an unknown or missing name', () => {
		expect(iconId(GENERIC_MODULE_ICON_URL)).toBe('generic');
		expect(getModuleIconUrl('no_such_module')).toBe(GENERIC_MODULE_ICON_URL);
		expect(getModuleIconUrl(undefined)).toBe(GENERIC_MODULE_ICON_URL);
		expect(getModuleIconUrl('')).toBe(GENERIC_MODULE_ICON_URL);
	});
});
