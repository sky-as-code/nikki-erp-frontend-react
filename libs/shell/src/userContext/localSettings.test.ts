import { dispatchServiceMethod } from '@nikkierp/ui/appState/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LOCAL_SETTINGS_STORAGE_KEY } from './types';
import { loadSavedLocalSettings, userContextService } from './userContextService';


const storage = new Map<string, string>();
vi.stubGlobal('localStorage', {
	getItem: (key: string) => storage.get(key) ?? null,
	setItem: (key: string, value: string) => { storage.set(key, value); },
	removeItem: (key: string) => { storage.delete(key); },
	clear: () => storage.clear(),
});

describe('loadSavedLocalSettings', () => {
	beforeEach(() => storage.clear());

	it('defaults to auto when nothing is saved', () => {
		expect(loadSavedLocalSettings()).toEqual({ languageCode: null, themeMode: 'auto' });
	});

	it('restores the saved theme, which the sign-in page shows', () => {
		storage.set(LOCAL_SETTINGS_STORAGE_KEY, btoa(JSON.stringify({ languageCode: 'vi', themeMode: 'dark' })));
		expect(loadSavedLocalSettings()).toEqual({ languageCode: 'vi', themeMode: 'dark' });
	});

	it('falls back to auto on a corrupt value instead of throwing', () => {
		storage.set(LOCAL_SETTINGS_STORAGE_KEY, 'not base64 json');
		expect(loadSavedLocalSettings()).toEqual({ languageCode: null, themeMode: 'auto' });
	});

	it('fills a missing theme with auto', () => {
		storage.set(LOCAL_SETTINGS_STORAGE_KEY, btoa(JSON.stringify({ languageCode: 'en' })));
		expect(loadSavedLocalSettings()).toEqual({ languageCode: 'en', themeMode: 'auto' });
	});

	it('keeps a theme chosen after sign-in for the next sign-in page', async () => {
		await dispatchServiceMethod(userContextService.setLocalSettings, { languageCode: 'en', themeMode: 'dark' });
		expect(loadSavedLocalSettings().themeMode).toBe('dark');
	});
});
