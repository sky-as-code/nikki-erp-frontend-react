import { capitalizeWords } from '@nikkierp/common/utils';


/**
 * How a navigation changes the trail of the entry it lands on.
 *
 * - `sibling`: replace the last node when the target is its sibling, parent or child; else append.
 * - `append`: always push the target.
 * - `root`: the target starts a new trail.
 */
export type LinkMode = 'sibling' | 'append' | 'root';

export type TrailParent = {
	path: string,
	label?: string,
};

export type TrailNode = {
	/** Pathname, without a trailing slash. */
	path: string,
	/**
	 * The page called `useBreadcrumbsNode`. Only the current entry's own node can lack it: leaving a
	 * page that never registered ends the trail.
	 */
	registered?: boolean,
	/** The entry's query string, so a crumb click restores a list's filters. */
	search?: string,
	label?: string,
	/**
	 * The implicit list parent a detail page declares, shown before the node when it is the first
	 * of the trail. Stored on the node so it survives once the page that declared it is left.
	 */
	parent?: TrailParent,
};

export const MAX_TRAIL_NODES = 8;

export function normalizePath(path: string): string {
	return path.length > 1 && path.endsWith('/') ? path.replace(/\/+$/, '') : path;
}

function segmentsOf(path: string): string[] {
	return normalizePath(path).split('/').filter(Boolean);
}

function isPrefixOf(shorter: string[], longer: string[]): boolean {
	return shorter.length + 1 === longer.length && shorter.every((segment, i) => segment === longer[i]);
}

/** True when `target` is the same page as `current`, its sibling, its direct parent or its direct child. */
export function isSiblingNode(current: string, target: string): boolean {
	const currentSegments = segmentsOf(current);
	const targetSegments = segmentsOf(target);
	if (currentSegments.length === targetSegments.length) {
		const last = currentSegments.length - 1;
		return currentSegments.every((segment, i) => i === last || segment === targetSegments[i]);
	}
	return isPrefixOf(currentSegments, targetSegments) || isPrefixOf(targetSegments, currentSegments);
}

export function applyLink(trail: TrailNode[], target: TrailNode, mode: LinkMode): TrailNode[] {
	if (mode === 'root' || trail.length === 0) {
		return [target];
	}
	const last = trail[trail.length - 1];
	const next = mode === 'sibling' && isSiblingNode(last.path, target.path)
		? [...trail.slice(0, -1), target]
		: [...trail, target];
	return normalizeTrail(next);
}

/**
 * Revisiting a node already in the trail truncates back to it, keeping what the earlier visit
 * learnt (label, parent), so a navigation cycle never grows the trail.
 */
export function normalizeTrail(trail: TrailNode[]): TrailNode[] {
	if (trail.length === 0) {
		return trail;
	}
	const target = trail[trail.length - 1];
	const earlier = trail.findIndex(node => node.path === target.path);
	let result = trail;
	if (earlier < trail.length - 1) {
		result = [...trail.slice(0, earlier), mergeNode(trail[earlier], target)];
	}
	return result.length > MAX_TRAIL_NODES ? result.slice(result.length - MAX_TRAIL_NODES) : result;
}

function mergeNode(known: TrailNode, fresh: TrailNode): TrailNode {
	return {
		...known,
		search: fresh.search,
		label: fresh.label ?? known.label,
		parent: fresh.parent ?? known.parent,
	};
}

export function trailNodeHref(node: { path: string, search?: string }): string {
	return `${node.path}${node.search ?? ''}`;
}

const ID_LIKE = /^(new|[0-9A-HJKMNP-TV-Z]{26}|\d+|[0-9a-f-]{32,36})$/i;

/** Last-resort label: the route segment that names the resource, `inventory_brand` → `Inventory Brand`. */
export function humanizeNodePath(path: string): string {
	const segments = segmentsOf(path);
	const named = [...segments].reverse().find(segment => !ID_LIKE.test(segment)) ?? segments[segments.length - 1] ?? '';
	return capitalizeWords(named.replace(/[_-]+/g, ' '));
}
