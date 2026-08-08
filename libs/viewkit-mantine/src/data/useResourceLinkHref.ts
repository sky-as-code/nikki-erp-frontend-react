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
