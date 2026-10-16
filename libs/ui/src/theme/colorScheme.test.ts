import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createSyncedColorSchemeManager } from './colorScheme';


function stubWindow(): void {
	const store = new Map<string, string>();
	const target = new EventTarget();
	vi.stubGlobal('window', Object.assign(target, {
		localStorage: {
			getItem: (key: string) => store.get(key) ?? null,
			setItem: (key: string, value: string) => void store.set(key, value),
			removeItem: (key: string) => void store.delete(key),
		},
	}));
}

describe('createSyncedColorSchemeManager', () => {
	beforeEach(stubWindow);
	afterEach(() => vi.unstubAllGlobals());

	it('tells every other provider in the tab about a change', () => {
		const shell = createSyncedColorSchemeManager();
		const microApp = createSyncedColorSchemeManager();
		const onUpdate = vi.fn();
		microApp.subscribe(onUpdate);

		shell.set('dark');

		expect(onUpdate).toHaveBeenCalledWith('dark');
		expect(microApp.get('light')).toBe('dark');
	});

	it('does not re-announce a value already stored, so providers cannot echo it back', () => {
		const first = createSyncedColorSchemeManager();
		const second = createSyncedColorSchemeManager();
		const onUpdate = vi.fn();
		second.subscribe(onUpdate);
		first.set('dark');
		onUpdate.mockClear();

		second.set('dark');

		expect(onUpdate).not.toHaveBeenCalled();
	});
});
