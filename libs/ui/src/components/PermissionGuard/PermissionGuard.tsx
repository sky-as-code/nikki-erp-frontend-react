import { ResourceScope } from '@nikkierp/common/entitlements';
import React from 'react';
import { useLocation } from 'react-router';

import { InsufficientPermissionPage } from '../ErrorState';
import { LoadingState } from '../Loading';
import { useHasEntitlement, type EntitlementRequirementInput } from './entitlementContext';


/**
 * A permission a route requires. `scope` is optional and defaults to org, so an existing map that
 * predates scopes keeps working.
 */
export type RoutePermission = {
	resource: string,
	action: string,
	scope?: string,
};

export type GetRoutePermissionFn = (pathname: string) => RoutePermission | null;

/**
 * Gates a page or a subtree on the caller's entitlements.
 *
 * What this decides is what the UI SHOWS. The backend re-checks every request and remains the only
 * authority — never drop a server-side check because a route is guarded here.
 *
 * On refusal it renders the Insufficient Permission page **in place**, so the URL still names the
 * page the user asked for rather than a generic error route.
 */
export type PermissionGuardProps = {
	children: React.ReactNode,
	/**
	 * The permissions this subtree needs, all of which must hold. Each is either
	 * `{action, resource, scope}` or the literal a refusal would name, e.g. `update:products:org`.
	 */
	requires?: EntitlementRequirementInput[],
	/** Shorthand for a single requirement; `scope` defaults to org. */
	resource?: string,
	action?: string,
	scope?: string,
	/** Rendered instead of the refusal page, for a guard that sits inside a larger layout. */
	fallback?: React.ReactNode,
	/** Derives the requirement from the current path, for a route-driven permission map. */
	getRoutePermission?: GetRoutePermissionFn,
};

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
	children, requires, resource, action, scope, fallback, getRoutePermission,
}) => {
	const location = useLocation();

	const requirements = React.useMemo<EntitlementRequirementInput[]>(() => {
		if (requires && requires.length > 0) {
			return requires;
		}
		// Org is the default because almost every business resource is org-scoped; the active org
		// is filled in by the Shell's scope resolver.
		if (resource && action) {
			return [{ action, resource, scope: scope ?? ResourceScope.Org }];
		}
		const routePermission = getRoutePermission?.(location.pathname);
		if (routePermission) {
			return [{
				action: routePermission.action,
				resource: routePermission.resource,
				scope: routePermission.scope ?? ResourceScope.Org,
			}];
		}
		return [];
	}, [requires, resource, action, scope, getRoutePermission, location.pathname]);

	const decision = useHasEntitlement(requirements);

	// Nothing declared means nothing to check.
	if (requirements.length === 0) {
		return <>{children}</>;
	}

	// Waiting, not refusing: see EntitlementDecision.isPending.
	if (decision.isPending) {
		return <LoadingState />;
	}

	if (!decision.allowed) {
		return fallback ? <>{fallback}</> : <InsufficientPermissionPage missing={decision.missing} />;
	}

	return <>{children}</>;
};

/**
 * The HOC form, for wrapping a page component rather than a subtree.
 *
 * `withEntitlements(ProductsPage, ['update:products:org'])`
 */
export function withEntitlements<P extends object>(
	Component: React.ComponentType<P>,
	requires: EntitlementRequirementInput[],
): React.FC<P> {
	const Guarded: React.FC<P> = props => (
		<PermissionGuard requires={requires}>
			<Component {...props} />
		</PermissionGuard>
	);
	Guarded.displayName = `withEntitlements(${Component.displayName ?? Component.name ?? 'Component'})`;
	return Guarded;
}
