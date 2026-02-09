import React from 'react';
import { useLocation } from 'react-router';

import { Unauthorized } from '@nikkierp/ui/components';

import { ACTIONS, RESOURCES, useHasPermission } from '../../../../shell/src/userContext';
import { PermissionScopeType } from '../../../../shell/src/userContext/userContextService';


export type RoutePermission = {
	resource: string;
	action: string;
};

export type GetRoutePermissionFn = (pathname: string) => RoutePermission | null;

interface PermissionGuardProps {
	children: React.ReactNode;
	resource?: string;
	action?: string;
	contextScope?: { scopeType: PermissionScopeType ; scopeRef: string };
	fallback?: React.ReactNode;
	getRoutePermission?: GetRoutePermissionFn;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
	children,
	resource,
	action,
	contextScope,
	fallback,
	getRoutePermission,
}) => {
	const location = useLocation();
	const routePermission = React.useMemo(() => {
		if (resource && action) {
			return { resource, action };
		}
		if (getRoutePermission) {
			return getRoutePermission(location.pathname);
		}
		return null;
	}, [location, resource, action, contextScope]);

	const hasAccess = useHasPermission(
		routePermission?.resource ?? RESOURCES.WILDCARD,
		routePermission?.action ?? ACTIONS.VIEW,
		contextScope,
	);

	if (!hasAccess) {
		if (fallback) {
			return <>{fallback}</>;
		}

		return <Unauthorized />;
	}

	return <>{children}</>;
};
