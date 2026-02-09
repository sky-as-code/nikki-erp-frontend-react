import type { GetRoutePermissionFn, RoutePermission } from './PermissionGuard';


export function createRoutePermissionMatcher(
	routePermissions: Record<string, RoutePermission>,
): GetRoutePermissionFn {
	return (pathname: string): RoutePermission | null => {
		const normalizedPath = pathname.replace(/\/$/, '') || '/';

		for (const [pattern, permission] of Object.entries(routePermissions)) {
			if (matchRoute(pattern, normalizedPath)) {
				return permission;
			}
		}

		return null;
	};
}

function matchRoute(pattern: string, pathname: string): boolean {
	const patternParts = pattern.split('/').filter(Boolean);
	const pathParts = pathname.split('/').filter(Boolean);

	if (patternParts.length !== pathParts.length) {
		return false;
	}

	for (let i = 0; i < patternParts.length; i++) {
		const patternPart = patternParts[i];
		const pathPart = pathParts[i];

		if (patternPart.startsWith(':')) {
			continue;
		}

		if (patternPart !== pathPart) {
			return false;
		}
	}

	return true;
}
