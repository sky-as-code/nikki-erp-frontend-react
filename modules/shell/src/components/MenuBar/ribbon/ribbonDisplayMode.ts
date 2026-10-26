import React from 'react';


export type RibbonDisplayMode = 'tabs-only' | 'ribbon';

export const RIBBON_DISPLAY_MODE_STORAGE_KEY = 'shell:menuBar:ribbonDisplayMode';

const DEFAULT_MODE: RibbonDisplayMode = 'tabs-only';
const listeners = new Set<() => void>();

/**
 * One value for every ribbon, kept per browser.
 *
 * Not part of `LocalSettings`: those mirror the account settings, and the user-context fetch and the
 * settings save bar both write them back with the server's fields only, which would drop this one.
 */
export function loadRibbonDisplayMode(): RibbonDisplayMode {
	try {
		return localStorage.getItem(RIBBON_DISPLAY_MODE_STORAGE_KEY) === 'ribbon' ? 'ribbon' : DEFAULT_MODE;
	}
	// Blocked storage (private window, cleared site data) falls back rather than breaking the header.
	catch {
		return DEFAULT_MODE;
	}
}

export function saveRibbonDisplayMode(mode: RibbonDisplayMode): void {
	try {
		localStorage.setItem(RIBBON_DISPLAY_MODE_STORAGE_KEY, mode);
	}
	catch {
		// Still applied for this page through the listeners below.
	}
	listeners.forEach(listener => listener());
}

function subscribe(listener: () => void): () => void {
	listeners.add(listener);
	window.addEventListener('storage', listener);
	return () => {
		listeners.delete(listener);
		window.removeEventListener('storage', listener);
	};
}

export function useRibbonDisplayMode(): [RibbonDisplayMode, (mode: RibbonDisplayMode) => void] {
	const mode = React.useSyncExternalStore(subscribe, loadRibbonDisplayMode, () => DEFAULT_MODE);
	return [mode, saveRibbonDisplayMode];
}
