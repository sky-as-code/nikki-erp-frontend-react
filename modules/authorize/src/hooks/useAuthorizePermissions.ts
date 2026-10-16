import { useHasEntitlement } from '@nikkierp/ui/components';
import React from 'react';

import { authzRequirement } from '../permissions';

import type { AuthzArea, AuthzOperation } from '../permissions';


type AreaPermissions = {
	canView: boolean,
	canCreate: boolean,
	canUpdate: boolean,
	canDelete: boolean,
	/** Entitlements missing for create, so a locked Create button can explain itself. */
	createMissing: string[],
};

type RolePermissions = AreaPermissions & { canAddEntitlement: boolean, canRemoveEntitlement: boolean };
type GrantRequestPermissions = AreaPermissions & { canRespond: boolean };

export type AuthorizePermissions = Record<Exclude<AuthzArea, 'role' | 'grantRequest'>, AreaPermissions> & {
	role: RolePermissions,
	grantRequest: GrantRequestPermissions,
};

const AREAS: AuthzArea[] = ['resource', 'action', 'entitlement', 'role', 'roleSuite', 'grantRequest', 'revokeRequest'];
const CRUD: AuthzOperation[] = ['view', 'create', 'update', 'delete'];
const EXTRA: Array<[AuthzArea, AuthzOperation]> = [
	['role', 'addEntitlement'], ['role', 'removeEntitlement'], ['grantRequest', 'respond'],
];
const ASKED: Array<[AuthzArea, AuthzOperation]> = [
	...AREAS.flatMap(area => CRUD.map(op => [area, op] as [AuthzArea, AuthzOperation])), ...EXTRA,
];

/**
 * What the caller may do in each authorize area, from the same entitlement check every other
 * module uses. While the user context loads everything reads as allowed, the convention the
 * shared locks follow: refusing on absent information would flash every control off.
 */
export function useAuthorizePermissions(): AuthorizePermissions {
	const requirements = React.useMemo(() => ASKED.map(([area, op]) => authzRequirement(area, op)), []);
	const decision = useHasEntitlement(requirements);

	return React.useMemo(() => {
		const allowed = new Map<string, boolean>();
		const missing = new Map<string, string[]>();
		ASKED.forEach(([area, op], index) => {
			const result = decision.results[index];
			allowed.set(`${area}.${op}`, decision.isPending || (result?.allowed ?? false));
			missing.set(`${area}.${op}`, result && !result.allowed ? [result.expression] : []);
		});
		const can = (area: AuthzArea, op: AuthzOperation) => allowed.get(`${area}.${op}`) ?? false;
		const area = (name: AuthzArea): AreaPermissions => ({
			canView: can(name, 'view'),
			canCreate: can(name, 'create'),
			canUpdate: can(name, 'update'),
			canDelete: can(name, 'delete'),
			createMissing: decision.isPending ? [] : (missing.get(`${name}.create`) ?? []),
		});
		return {
			resource: area('resource'),
			action: area('action'),
			entitlement: area('entitlement'),
			role: { ...area('role'), canAddEntitlement: can('role', 'addEntitlement'), canRemoveEntitlement: can('role', 'removeEntitlement') },
			roleSuite: area('roleSuite'),
			grantRequest: { ...area('grantRequest'), canRespond: can('grantRequest', 'respond') },
			revokeRequest: area('revokeRequest'),
		};
	}, [decision]);
}
