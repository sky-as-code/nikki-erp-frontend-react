import { ACTIONS, RESOURCES } from './permissionConstants';

import type { PermissionScopeEntry, PermissionScopeType, PermissionsSnapshot } from './userContextService';


function actionsInclude(actions: string[], wanted: string): boolean {
	if (actions.includes(ACTIONS.WILDCARD)) return true;
	return actions.includes(wanted);
}

function scopeMatches(
	entry: PermissionScopeEntry,
	scopeType: PermissionScopeType,
	scopeRef: string,
): boolean {
	if (entry.scopeType === 'domain') return true;
	if (entry.scopeType === scopeType) {
		return entry.scopeRef === scopeRef;
	}
	return false;
}

export function hasPermission(
	permissions: PermissionsSnapshot,
	resource: string,
	action: string,
	contextScope?: { scopeType: PermissionScopeType; scopeRef: string },
): boolean {
	const entries = permissions[RESOURCES.WILDCARD] ?? permissions[resource] ?? [];
	if (!entries.length) return false;

	const scopeType = contextScope?.scopeType ?? 'domain';
	const scopeRef = contextScope?.scopeRef ?? '';

	return entries.some(
		(entry) => scopeMatches(entry, scopeType, scopeRef) && actionsInclude(entry.actions, action),
	);
}

export function hasFullAccess(permissions: PermissionsSnapshot): boolean {
	return hasPermission(permissions, RESOURCES.WILDCARD, ACTIONS.WILDCARD);
}
