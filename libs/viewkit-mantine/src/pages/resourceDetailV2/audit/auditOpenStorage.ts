import React from 'react';


export const AUDIT_OPEN_STORAGE_KEY = 'viewkit:resourceDetail:auditOpen';

const listeners = new Set<() => void>();

/** One value for every detail page's Audit toggle, kept per browser. */
export function loadAuditOpen(): boolean {
	try {
		return localStorage.getItem(AUDIT_OPEN_STORAGE_KEY) === 'true';
	}
	// Blocked storage (private window, cleared site data) falls back to closed rather than breaking the page.
	catch {
		return false;
	}
}

export function saveAuditOpen(open: boolean): void {
	try {
		localStorage.setItem(AUDIT_OPEN_STORAGE_KEY, String(open));
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

export function useAuditOpen(): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
	const open = React.useSyncExternalStore(subscribe, loadAuditOpen, () => false);
	const setOpen = React.useCallback((next: React.SetStateAction<boolean>) => {
		saveAuditOpen(typeof next === 'function' ? next(loadAuditOpen()) : next);
	}, []);
	return [open, setOpen];
}
