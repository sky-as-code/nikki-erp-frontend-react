const STORAGE_KEY = 'nikki.navLabels';
const MAX_ENTRIES = 200;

/**
 * Labels by node path for the tab's session. A second source behind the labels stored on the
 * history entry: it fills a node the user reached again by another route. Safari does not copy
 * `sessionStorage` into a duplicated tab, which is why it is not the primary store.
 */
export function readCachedLabels(): Record<string, string> {
	try {
		const raw = window.sessionStorage.getItem(STORAGE_KEY);
		const parsed: unknown = raw ? JSON.parse(raw) : null;
		return parsed && typeof parsed === 'object' ? parsed as Record<string, string> : {};
	}
	catch {
		return {};
	}
}

export function cacheLabel(path: string, label: string): void {
	const labels = readCachedLabels();
	delete labels[path];
	labels[path] = label;
	const paths = Object.keys(labels);
	for (const stale of paths.slice(0, Math.max(0, paths.length - MAX_ENTRIES))) {
		delete labels[stale];
	}
	try {
		window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(labels));
	}
	catch {
		// Storage full or blocked: the label stays on the history entry.
	}
}
