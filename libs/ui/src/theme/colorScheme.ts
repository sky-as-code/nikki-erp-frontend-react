import { isMantineColorScheme } from '@mantine/core';

import type { MantineColorScheme, MantineColorSchemeManager } from '@mantine/core';


/** Mantine's own default key, kept so the Shell's `ApplyStoredTheme` reads the same value. */
const STORAGE_KEY = 'mantine-color-scheme-value';
const CHANGED_EVENT = 'nikki:color-scheme-changed';

/**
 * A colour-scheme manager that keeps every `MantineProvider` in the document in step.
 *
 * The Shell and each micro-app mount their own provider, in separate React roots. Mantine's default
 * manager only hears the `storage` event, which fires in *other* tabs, so a theme switch reached
 * the provider that made it and no other: CSS variables followed the `<html>` attribute, but every
 * colour a micro-app resolved in JS (`useComputedColorScheme`) kept the old scheme. This manager
 * also announces a same-tab change, and each provider applies it.
 *
 * `set` announces only a real change. A provider applying an announcement calls `set` with the
 * value already stored, so the announcement ends there instead of bouncing between providers.
 *
 * One instance per provider: Mantine gives a manager a single subscriber.
 */
export function createSyncedColorSchemeManager(): MantineColorSchemeManager {
	let handleStorage: ((event: StorageEvent) => void) | undefined;
	let handleChanged: ((event: Event) => void) | undefined;

	return {
		get: defaultValue => readStored() ?? defaultValue,
		set: (value) => {
			if (readStored() === value) return;
			try {
				window.localStorage.setItem(STORAGE_KEY, value);
			}
			catch {
				// Blocked storage still lets this tab switch; it just will not remember the choice.
			}
			window.dispatchEvent(new CustomEvent<MantineColorScheme>(CHANGED_EVENT, { detail: value }));
		},
		subscribe: (onUpdate) => {
			handleStorage = (event) => {
				if (event.key === STORAGE_KEY && isMantineColorScheme(event.newValue)) onUpdate(event.newValue);
			};
			handleChanged = (event) => {
				const value = (event as CustomEvent<unknown>).detail;
				if (isMantineColorScheme(value)) onUpdate(value);
			};
			window.addEventListener('storage', handleStorage);
			window.addEventListener(CHANGED_EVENT, handleChanged);
		},
		unsubscribe: () => {
			if (handleStorage) window.removeEventListener('storage', handleStorage);
			if (handleChanged) window.removeEventListener(CHANGED_EVENT, handleChanged);
		},
		clear: () => {
			try {
				window.localStorage.removeItem(STORAGE_KEY);
			}
			catch {
				// Nothing stored that can be reached, so nothing to clear.
			}
		},
	};
}

function readStored(): MantineColorScheme | null {
	if (typeof window === 'undefined') return null;
	try {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		return isMantineColorScheme(stored) ? stored : null;
	}
	catch {
		return null;
	}
}
