import type * as dyn from '@nikkierp/common/dynamicModel';


const GRAPH_KEYS = ['if', 'and', 'or', 'order'];
const BRANCH_KEYS = ['if', 'and', 'or'];

/**
 * Reads the `initialGraph` query-string parameter: URL-encoded JSON, the same wire form the
 * backend reads it in.
 *
 * A graph that will not parse is dropped rather than surfaced: it only seeds the filter panel, so
 * a stale or hand-edited link should open the list unfiltered instead of a dead page.
 */
export function parseSearchGraphParam(raw: string | null | undefined): dyn.SearchGraph | undefined {
	if (!raw) {
		return undefined;
	}
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	}
	catch {
		console.warn('[resourceList] ignoring a malformed `initialGraph` query parameter');
		return undefined;
	}
	if (!isSearchGraphShape(parsed)) {
		console.warn('[resourceList] ignoring an `initialGraph` query parameter that is not a search graph');
		return undefined;
	}
	return parsed;
}

/**
 * The shape check the panel needs, not a full validation: the keys the wire format defines, and
 * the one-branch-per-node rule the backend enforces. Anything deeper is left to the server, whose
 * own rules are the authority and would only drift if restated here.
 */
export function isSearchGraphShape(value: unknown): value is dyn.SearchGraph {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		return false;
	}
	const keys = Object.keys(value);
	if (keys.length === 0 || !keys.every(key => GRAPH_KEYS.includes(key))) {
		return false;
	}
	return BRANCH_KEYS.filter(key => key in value).length <= 1;
}
