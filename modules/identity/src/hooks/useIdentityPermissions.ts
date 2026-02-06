import { RESOURCES, useResourcePermissions } from '@nikkierp/shell/userContext';

import { useOrgScopeRef } from './identityScope';


export function useIdentityPermissions() {
	const orgScopeRef = useOrgScopeRef();
	const orgContextScope = orgScopeRef
		? { scopeType: 'org' as const, scopeRef: orgScopeRef }
		: undefined;

	return useResourcePermissions({
		user: { resource: RESOURCES.IDENTITY_USER, contextScope: orgContextScope},
		group: { resource: RESOURCES.IDENTITY_GROUP, contextScope: orgContextScope},
		hierarchy: { resource: RESOURCES.IDENTITY_HIERARCHY_LEVEL, contextScope: orgContextScope},
		organization: { resource: RESOURCES.IDENTITY_ORGANIZATION },
	});
}
