import { isSiblingNode, trailNodeHref } from './trail';

import type { TrailNode, TrailParent } from './trail';
import type React from 'react';


export type Crumb = {
	key: string,
	/** `undefined` for the last crumb, which is the current page and plain text. */
	href?: string,
	label?: React.ReactNode,
	/** An implicit list parent: clicking it starts a new trail rather than appending the list. */
	isHistoryRoot?: boolean,
};

export type BuildCrumbsInput = {
	trail: TrailNode[] | null,
	/** The page's own node; the trail is shown up to it. */
	nodePath: string,
	lastNodeLabel?: React.ReactNode,
	rootParent?: TrailParent,
	hideLastNode?: boolean,
};

export const DEFAULT_NODE_LIMITS = 5;
export const COMPACT_NODE_LIMITS = 2;

export function buildCrumbs({ trail, nodePath, lastNodeLabel, rootParent, hideLastNode }: BuildCrumbsInput): Crumb[] {
	const nodes = visibleNodes(trail ?? [], nodePath);
	const crumbs: Crumb[] = [];
	nodes.forEach((node, i) => {
		const isLast = i === nodes.length - 1;
		const parent = i === 0 ? ((isLast ? rootParent : undefined) ?? node.parent) : undefined;
		if (parent && parent.path !== node.path) {
			crumbs.push({
				key: `parent:${parent.path}`, href: parent.path, label: parent.label, isHistoryRoot: true,
			});
		}
		crumbs.push({
			key: node.path,
			href: isLast ? undefined : trailNodeHref(node),
			label: isLast ? (lastNodeLabel ?? node.label) : node.label,
		});
	});
	return hideLastNode ? crumbs.slice(0, -1) : crumbs;
}

function visibleNodes(trail: TrailNode[], nodePath: string): TrailNode[] {
	const index = trail.findIndex(node => node.path === nodePath);
	if (index >= 0) {
		return trail.slice(0, index + 1);
	}
	// A split-view list pane: the record shown beside it replaced the list's own node.
	const last = trail[trail.length - 1];
	return last && isSiblingNode(last.path, nodePath)
		? [...trail.slice(0, -1), { path: nodePath }]
		: [{ path: nodePath }];
}

export function effectiveNodeLimits(nodeLimits: number | undefined, isCompact: boolean): number {
	if (isCompact) {
		return COMPACT_NODE_LIMITS;
	}
	const limit = Math.floor(nodeLimits ?? DEFAULT_NODE_LIMITS);
	return limit >= COMPACT_NODE_LIMITS ? limit : DEFAULT_NODE_LIMITS;
}

/**
 * Fits the crumbs into `limit` displayed items, the `(...)` dropdown and the last crumb included:
 * past the limit, the last `limit - 1` crumbs stay and the ones before fold into `(...)`.
 */
export function collapseCrumbs(crumbs: Crumb[], limit: number): { collapsed: Crumb[], shown: Crumb[] } {
	if (crumbs.length <= limit) {
		return { collapsed: [], shown: crumbs };
	}
	const kept = Math.max(limit - 1, 1);
	return { collapsed: crumbs.slice(0, crumbs.length - kept), shown: crumbs.slice(crumbs.length - kept) };
}
