import React from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

import { readEntryTrail, writeEntryTrail } from './historyTrail';
import { cacheLabel, readCachedLabels } from './navLabelCache';
import { applyLink, humanizeNodePath, normalizePath } from './trail';

import type { LinkMode, TrailNode, TrailParent } from './trail';
import type { Location, NavigationType } from 'react-router-dom';


/** Looks up a label for a node the user has not visited this session, e.g. by the record's label field. */
export type NodeLabelResolver = (path: string) => Promise<string | undefined>;

export type NodeInfoPatch = {
	/** The page called `useBreadcrumbsNode`: its entry is a breadcrumb node. */
	registered?: boolean,
	label?: string,
	parent?: TrailParent,
};

type NavHistoryContextValue = {
	trail: TrailNode[],
	setNodeInfo: (path: string, patch: NodeInfoPatch) => void,
};

const NavHistoryContext = React.createContext<NavHistoryContextValue | null>(null);
const LinkModeContext = React.createContext<LinkMode | undefined>(undefined);

export type NavHistoryProviderProps = React.PropsWithChildren<{
	resolveNodeLabel?: NodeLabelResolver,
}>;

type EntryTrail = { key: string, trail: TrailNode[] };

/**
 * Keeps the breadcrumb trail of the current history entry. Must sit inside the shell's one Router.
 *
 * A `POP` (Back/Forward, reload, duplicated tab, a URL typed in) restores the trail the entry
 * stored, or starts a one-node trail. A `PUSH`/`REPLACE` derives it from the entry being left and
 * the `navMode` the link put in the router state. Navigations nobody tagged default to `sibling`,
 * so an unmigrated link or `shell.routing.navigate` never breaks the trail, it just does not append.
 *
 * Only a page that calls `useBreadcrumbsNode` is a node. Every entry starts with its page as an
 * unregistered last node; leaving one that never registered (sign-in, Module Home, an error state,
 * a redirect) ends the trail, so the page reached from it starts afresh.
 */
export function NavHistoryProvider({ resolveNodeLabel, children }: NavHistoryProviderProps): React.ReactNode {
	const location = useLocation();
	const navType = useNavigationType();
	const [entry, setEntry] = React.useState<EntryTrail>(() => ({
		key: location.key, trail: deriveEntryTrail([], location, navType),
	}));
	const [labels, setLabels] = React.useState<Record<string, string>>(readCachedLabels);

	let current = entry;
	if (entry.key !== location.key) {
		// Derived during render, not in an effect, so the page never paints the previous entry's trail.
		current = { key: location.key, trail: deriveEntryTrail(entry.trail, location, navType) };
		setEntry(current);
	}

	React.useLayoutEffect(() => {
		writeEntryTrail(current.trail);
	}, [current.trail]);

	const setNodeInfo = React.useCallback((path: string, patch: NodeInfoPatch) => {
		const nodePath = normalizePath(path);
		if (patch.label) {
			const label = patch.label;
			cacheLabel(nodePath, label);
			setLabels(prev => (prev[nodePath] === label ? prev : { ...prev, [nodePath]: label }));
		}
		setEntry((prev) => {
			const trail = patchTrail(prev.trail, nodePath, patch);
			return trail === prev.trail ? prev : { ...prev, trail };
		});
	}, []);

	useResolveMissingLabels(current.trail, labels, location.pathname, resolveNodeLabel, setLabels);

	const trail = React.useMemo(() => current.trail.map(node => (
		node.label || !labels[node.path] ? node : { ...node, label: labels[node.path] }
	)), [current.trail, labels]);
	const value = React.useMemo(() => ({ trail, setNodeInfo }), [trail, setNodeInfo]);

	return <NavHistoryContext.Provider value={value}>{children}</NavHistoryContext.Provider>;
}

function deriveEntryTrail(previous: TrailNode[], location: Location, navType: NavigationType): TrailNode[] {
	let target: TrailNode = { path: normalizePath(location.pathname), search: location.search || undefined };
	if (navType === 'POP') {
		const stored = readEntryTrail();
		const storedLast = stored?.[stored.length - 1];
		return stored && storedLast?.path === target.path
			? [...stored.slice(0, -1), { ...storedLast, search: target.search }]
			: [target];
	}
	const last = previous[previous.length - 1];
	if (last?.path === target.path) {
		// The same page rewriting its query string (filters): it keeps its node, registered or not yet.
		target = { ...last, search: target.search };
	}
	else if (last && !last.registered) {
		return [target];
	}
	const base = navType === 'REPLACE' ? previous.slice(0, -1) : previous;
	return applyLink(base, target, readNavMode(location.state) ?? 'sibling');
}

function readNavMode(state: unknown): LinkMode | undefined {
	const mode = state && typeof state === 'object' ? (state as { navMode?: unknown }).navMode : undefined;
	return mode === 'root' || mode === 'append' || mode === 'sibling' ? mode : undefined;
}

function patchTrail(trail: TrailNode[], path: string, patch: NodeInfoPatch): TrailNode[] {
	let changed = false;
	const next = trail.map((node) => {
		if (node.path !== path) {
			return node;
		}
		const merged: TrailNode = {
			...node,
			registered: patch.registered ?? node.registered,
			label: patch.label ?? node.label,
			parent: patch.parent ?? node.parent,
		};
		const same = merged.registered === node.registered && merged.label === node.label
			&& merged.parent?.path === node.parent?.path && merged.parent?.label === node.parent?.label;
		changed ||= !same;
		return same ? node : merged;
	});
	return changed ? next : trail;
}

function useResolveMissingLabels(
	trail: TrailNode[],
	labels: Record<string, string>,
	pathname: string,
	resolveNodeLabel: NodeLabelResolver | undefined,
	setLabels: React.Dispatch<React.SetStateAction<Record<string, string>>>,
): void {
	const requested = React.useRef(new Set<string>());
	const currentPath = normalizePath(pathname);

	React.useEffect(() => {
		// The current page names itself through `useBreadcrumbsNode`; only the nodes before it are looked up.
		const missing = trail
			.filter(node => node.path !== currentPath && !node.label && !labels[node.path])
			.map(node => node.path)
			.filter(path => !requested.current.has(path));
		for (const path of missing) {
			requested.current.add(path);
			const settle = (label: string | undefined) => setLabels(prev => (
				prev[path] ? prev : { ...prev, [path]: label || humanizeNodePath(path) }
			));
			if (!resolveNodeLabel) {
				settle(undefined);
				continue;
			}
			resolveNodeLabel(path).then(settle, () => settle(undefined));
		}
	}, [trail, labels, currentPath, resolveNodeLabel, setLabels]);
}

/** The current entry's trail, labels filled where known; `null` outside a {@link NavHistoryProvider}. */
export function useNavTrail(): TrailNode[] | null {
	return React.useContext(NavHistoryContext)?.trail ?? null;
}

/** Stores what a page knows about its own node (label, implicit parent) on the current entry. */
export function useSetNodeInfo(): ((path: string, patch: NodeInfoPatch) => void) | null {
	return React.useContext(NavHistoryContext)?.setNodeInfo ?? null;
}

/** Sets the default {@link LinkMode} of every `Link` below it, e.g. `append` for a record's related-resource tabs. */
export function LinkModeScope({ mode, children }: React.PropsWithChildren<{ mode: LinkMode }>): React.ReactNode {
	return <LinkModeContext.Provider value={mode}>{children}</LinkModeContext.Provider>;
}

export function useLinkModeScope(): LinkMode | undefined {
	return React.useContext(LinkModeContext);
}

export function withNavMode(state: unknown, mode: LinkMode | undefined): unknown {
	if (!mode) {
		return state;
	}
	if (state === undefined || state === null) {
		return { navMode: mode };
	}
	return typeof state === 'object' ? { ...state, navMode: mode } : state;
}
