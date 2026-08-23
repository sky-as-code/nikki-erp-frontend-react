import React from 'react';
import { useParams } from 'react-router-dom';


/**
 * Builds `/{orgSlug}/{moduleSlug}/{routePath}` for the current org and module,
 * or `undefined` while any of them is unknown.
 *
 * `routePath` is the *target* page segment, which is not always the current one.
 */
export function useResourceBaseHref(routePath: string | undefined): string | undefined {
	const { orgSlug, moduleSlug } = useParams();

	return React.useMemo(
		() => buildResourceBaseHref(orgSlug, moduleSlug, routePath),
		[orgSlug, moduleSlug, routePath],
	);
}

/**
 * Builds `/{orgSlug}/{moduleSlug}/{routePath}/{id}` for a table row.
 *
 * `routePath` is the *target* page segment, which is not always the current
 * one: a users table embedded in a role detail page passes `'users'`.
 */
export function useResourceLinkHref(
	linkField: string | undefined,
	routePath: string | undefined,
): (rowData: Record<string, unknown>) => string {
	const baseHref = useResourceBaseHref(routePath);

	return React.useCallback((rowData: Record<string, unknown>) => {
		if (!linkField || !baseHref) {
			return '#';
		}
		return `${baseHref}/${encodeURIComponent(String(rowData[linkField]))}`;
	}, [linkField, baseHref]);
}

/**
 * Resolves a **page** `routePath` -- the same string its `definePage` registers -- into an
 * absolute href, filling every `:param` token from the current route.
 *
 * `ViewEngineRouter` registers every page as its own *flat* route, so a path-relative `'..'`
 * pops the whole route to the module root rather than one segment. Naming the target page
 * outright sidesteps that: the result never depends on which route happens to be current.
 *
 * Returns `undefined` while the org, the module or any `:param` is still unknown, which is the
 * signal to render the link disabled rather than pointing it at a half-built path.
 *
 * A `routePath` that starts with `.` is left to React Router's own relative resolution: the
 * existing `'../'` back links mean exactly what they say and must keep working.
 */
export function useRoutePathHref(routePath: string | undefined): string | undefined {
	const params = useParams();

	return React.useMemo(() => {
		if (routePath?.startsWith('.')) {
			return routePath;
		}
		const filled = fillRouteParams(routePath, params);
		return buildResourceBaseHref(params.orgSlug, params.moduleSlug, filled);
	}, [routePath, params]);
}

/** Whether `routePath` names a page outright, as opposed to a `'../'`-style relative link. */
export function isAbsoluteRoutePath(routePath: string | undefined): boolean {
	return routePath != null && !routePath.startsWith('.');
}

/**
 * Substitutes `:param` segments from the current route's params.
 *
 * Returns `undefined` when any of them is missing, so a caller renders nothing rather than a
 * link containing a literal `:id`.
 *
 * Exported for its own test: the substitution rule is the part worth pinning, and it is plain
 * data in and data out.
 */
export function fillRouteParams(
	routePath: string | undefined,
	params: Readonly<Record<string, string | undefined>>,
): string | undefined {
	if (!routePath) {
		return undefined;
	}
	const segments = routePath.split('/');
	const filled: string[] = [];
	for (const segment of segments) {
		if (!segment.startsWith(':')) {
			filled.push(segment);
			continue;
		}
		const value = params[segment.slice(1)];
		if (value == null) {
			return undefined;
		}
		filled.push(value);
	}
	return filled.join('/');
}

function buildResourceBaseHref(
	orgSlug: string | undefined,
	moduleSlug: string | undefined,
	routePath: string | undefined,
): string | undefined {
	if (!routePath || !orgSlug || !moduleSlug) {
		return undefined;
	}
	const pageSeg = routePath.split('/').filter(Boolean).map(seg => encodeURIComponent(seg)).join('/');
	return `/${encodeURIComponent(orgSlug)}/${encodeURIComponent(moduleSlug)}/${pageSeg}`;
}
