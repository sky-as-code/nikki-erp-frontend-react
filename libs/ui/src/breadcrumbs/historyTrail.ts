import type { TrailNode } from './trail';


const STATE_KEY = 'navTrail';

/**
 * The trail lives on the browser history entry itself, beside React Router's `usr`/`key`/`idx`,
 * so Back/Forward, reload and "Duplicate tab" (Chromium and Firefox clone the entries) hand each
 * entry back its own breadcrumbs without anything in the URL.
 */
export function readEntryTrail(): TrailNode[] | null {
	const state: unknown = window.history.state;
	if (!state || typeof state !== 'object') {
		return null;
	}
	const trail = (state as Record<string, unknown>)[STATE_KEY];
	if (!Array.isArray(trail) || trail.length === 0) {
		return null;
	}
	return trail.every(isTrailNode) ? trail : null;
}

/**
 * `replaceState` is not observed by React Router, so writing here never re-renders or loops.
 * Safari throttles it (100 calls per 30 s); one write per navigation plus one per label is far below.
 */
export function writeEntryTrail(trail: TrailNode[]): void {
	const state: unknown = window.history.state;
	const base = state && typeof state === 'object' ? state : {};
	try {
		window.history.replaceState({ ...base, [STATE_KEY]: trail }, '');
	}
	catch {
		// A throttled or unserialisable write only costs the restored labels; the trail is still in memory.
	}
}

function isTrailNode(value: unknown): value is TrailNode {
	return Boolean(value) && typeof value === 'object' && typeof (value as TrailNode).path === 'string';
}
