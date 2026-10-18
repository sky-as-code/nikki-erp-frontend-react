import { describe, expect, it } from 'vitest';

import { GENERIC_MODULE_ICON_URL, getModuleIconUrl } from './moduleIconUrl';
import genericUrl from '../../assets/moduleIconsBlueAmber/generic.svg?url';
import iamUrl from '../../assets/moduleIconsBlueAmber/iam.svg?url';
import vendingMachineUrl from '../../assets/moduleIconsBlueAmber/vendingmachine.svg?url';


// Blue-amber icons carry no ids and Vite may inline them as data: URIs, so compare against a direct import.
describe('getModuleIconUrl', () => {
	it('resolves an icon named after the backend module', () => {
		expect(getModuleIconUrl('vendingmachine')).toBe(vendingMachineUrl);
		expect(getModuleIconUrl('iam')).toBe(iamUrl);
		expect(iamUrl).not.toBe(vendingMachineUrl);
	});

	it('falls back to the generic icon for an unknown or missing name', () => {
		expect(GENERIC_MODULE_ICON_URL).toBe(genericUrl);
		expect(getModuleIconUrl('no_such_module')).toBe(GENERIC_MODULE_ICON_URL);
		expect(getModuleIconUrl(undefined)).toBe(GENERIC_MODULE_ICON_URL);
		expect(getModuleIconUrl('')).toBe(GENERIC_MODULE_ICON_URL);
	});
});
