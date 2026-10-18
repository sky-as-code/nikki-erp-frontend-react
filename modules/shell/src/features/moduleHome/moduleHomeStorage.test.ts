import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	DEFAULT_MODULE_HOME_PREFS, loadModuleHomePrefs, MODULE_HOME_STORAGE_KEY, saveModuleHomePrefs,
} from './moduleHomeStorage';


const storage = new Map<string, string>();
const fakeLocalStorage = {
	getItem: (key: string) => storage.get(key) ?? null,
	setItem: (key: string, value: string) => { storage.set(key, value); },
	removeItem: (key: string) => { storage.delete(key); },
	clear: () => { storage.clear(); },
};


describe('moduleHomeStorage', () => {
	beforeEach(() => {
		storage.clear();
		vi.stubGlobal('localStorage', fakeLocalStorage);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('returns the defaults when nothing is stored', () => {
		expect(loadModuleHomePrefs()).toEqual(DEFAULT_MODULE_HOME_PREFS);
	});

	it('round-trips view mode and group by under shell:moduleHome', () => {
		saveModuleHomePrefs({ viewMode: 'grid', groupBy: 'none' });

		expect(JSON.parse(storage.get(MODULE_HOME_STORAGE_KEY)!)).toEqual({ viewMode: 'grid', groupBy: 'none' });
		expect(loadModuleHomePrefs()).toEqual({ viewMode: 'grid', groupBy: 'none' });
	});

	it('falls back field by field when a stored value is not allowed', () => {
		storage.set(MODULE_HOME_STORAGE_KEY, JSON.stringify({ viewMode: 'grid', groupBy: 'brand' }));
		expect(loadModuleHomePrefs()).toEqual({ viewMode: 'grid', groupBy: DEFAULT_MODULE_HOME_PREFS.groupBy });

		storage.set(MODULE_HOME_STORAGE_KEY, JSON.stringify({ viewMode: 'table', groupBy: 'none' }));
		expect(loadModuleHomePrefs()).toEqual({ viewMode: DEFAULT_MODULE_HOME_PREFS.viewMode, groupBy: 'none' });
	});

	it('returns the defaults for malformed or non-object JSON', () => {
		storage.set(MODULE_HOME_STORAGE_KEY, '{not json');
		expect(loadModuleHomePrefs()).toEqual(DEFAULT_MODULE_HOME_PREFS);

		storage.set(MODULE_HOME_STORAGE_KEY, '"grid"');
		expect(loadModuleHomePrefs()).toEqual(DEFAULT_MODULE_HOME_PREFS);
	});

	it('neither throws nor remembers when localStorage is unavailable', () => {
		vi.unstubAllGlobals();
		vi.stubGlobal('localStorage', undefined);

		expect(() => saveModuleHomePrefs({ viewMode: 'grid', groupBy: 'none' })).not.toThrow();
		expect(loadModuleHomePrefs()).toEqual(DEFAULT_MODULE_HOME_PREFS);
	});
});
