import { describe, expect, it } from 'vitest';

import { enumOptionValues, enumValueLabel } from './enumSettingOptions';


const bundle: Record<string, string> = {
	'essential.settings.themeMode.light': 'Light',
	'settings.density.compact': 'Compact',
};
const t = (key: string, options: { defaultValue: string }) => bundle[key] ?? options.defaultValue;

describe('enumValueLabel', () => {
	it('prefers the schema label key', () => {
		expect(enumValueLabel(t, ['essential.settings.themeMode', 'settings.themeMode'], 'light')).toBe('Light');
	});

	it('falls back to the item label key', () => {
		expect(enumValueLabel(t, ['essential.settings.density', 'settings.density'], 'compact')).toBe('Compact');
	});

	it('shows the stored value when no key translates', () => {
		expect(enumValueLabel(t, [undefined, 'settings.themeMode'], 'auto')).toBe('auto');
	});
});

describe('enumOptionValues', () => {
	it('keeps only string entries', () => {
		expect(enumOptionValues(['a', 1, 'b'])).toEqual(['a', 'b']);
		expect(enumOptionValues(undefined)).toEqual([]);
	});
});
