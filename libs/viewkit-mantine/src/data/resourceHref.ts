import { MicroAppHostContext } from '@nikkierp/ui/microApp';
import React from 'react';
import { useParams } from 'react-router-dom';

import { routeRoot, useModuleRoutes } from './moduleRoutes';

import type { ModuleRoutes } from './moduleRoutes';


export type ResourceTarget = {
	/** Schema of the record, which is also the route of its page. */
	schemaName: string,
	recordId?: string,
	/**
	 * Explicit module prefix, e.g. `/production`, for a module that implements neighbour proxy pages of
	 * the target. Without it the module is worked out: the current one when it serves the route, else
	 * the micro-app owning the schema.
	 */
	pathPrefix?: string,
};

type ResolveInput = {
	routePath: string,
	pathPrefix?: string,
	currentSlug?: string,
	moduleRoutes: ModuleRoutes | null,
	ownerSlugOf: (schemaName: string) => string | undefined,
};

/**
 * The module slug a bare route path belongs to. A route the current module serves (its own page or a
 * proxy copy) stays in it; any other route goes to the owner of the schema its first segment names.
 * Outside a module router (no route list) the current module is kept, as before.
 */
export function resolveRouteModule(input: Omit<ResolveInput, 'pathPrefix'>): string | undefined {
	const root = routeRoot(input.routePath);
	if (!input.moduleRoutes || input.moduleRoutes.routes.has(root)) {
		return input.currentSlug;
	}
	return input.ownerSlugOf(root) ?? input.currentSlug;
}

/** `/{module}/{routePath}` for a bare path, the path itself for an absolute one, or the explicit prefix. */
export function resolveRouteHref(input: ResolveInput): string | undefined {
	const { routePath } = input;
	const segments = routePath.split('/').filter(Boolean).map(seg => encodeURIComponent(seg)).join('/');
	if (routePath.startsWith('/')) {
		return `/${segments}`;
	}
	if (input.pathPrefix) {
		return `/${input.pathPrefix.split('/').filter(Boolean).join('/')}/${segments}`;
	}
	const moduleSlug = resolveRouteModule(input);
	return moduleSlug ? `/${encodeURIComponent(moduleSlug)}/${segments}` : undefined;
}

/** Looks a schema's owning micro-app up from the host's registry; tolerant of a missing host (tests). */
export function useOwnerSlugOf(): (schemaName: string) => string | undefined {
	const host = React.useContext(MicroAppHostContext);
	return React.useCallback(
		(schemaName: string) => host?.manager.findOwnerSlug(schemaName),
		[host],
	);
}

/** The href of a resource's list (no `recordId`) or of one record, resolved to the module serving it. */
export function useResourceHref(target: ResourceTarget): string | undefined {
	const params = useParams();
	const moduleRoutes = useModuleRoutes();
	const ownerSlugOf = useOwnerSlugOf();
	return React.useMemo(() => {
		const base = resolveRouteHref({
			routePath: target.schemaName, pathPrefix: target.pathPrefix,
			currentSlug: params.moduleSlug, moduleRoutes, ownerSlugOf,
		});
		if (!base || target.recordId == null) {
			return base;
		}
		return `${base}/${encodeURIComponent(target.recordId)}`;
	}, [target.schemaName, target.recordId, target.pathPrefix, params.moduleSlug, moduleRoutes, ownerSlugOf]);
}
