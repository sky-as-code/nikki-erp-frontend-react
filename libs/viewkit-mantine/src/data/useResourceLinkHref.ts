import React from 'react';
import { useParams } from 'react-router-dom';


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
	const { orgSlug, moduleSlug } = useParams();

	return React.useCallback((rowData: Record<string, unknown>) => {
		if (!linkField || !routePath || !orgSlug || !moduleSlug) {
			return '#';
		}
		const pageSeg = routePath.split('/').filter(Boolean).map(seg => encodeURIComponent(seg)).join('/');
		const raw = rowData[linkField];
		return `/${encodeURIComponent(orgSlug)}/${encodeURIComponent(moduleSlug)}/${pageSeg}/${encodeURIComponent(String(raw))}`;
	}, [linkField, routePath, orgSlug, moduleSlug]);
}
