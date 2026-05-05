// import { GLOBAL_CONTEXT_SLUG } from '@nikkierp/shell/constants';
// import { RESOURCES, useResourcePermissions } from '@nikkierp/shell/userContext';
// import { useActiveOrgModule } from '@nikkierp/ui/appState/routingSlice';

// import { useOrgScopeRef } from './identityScope';


// export function useIdentityPermissions() {
// 	const { orgSlug } = useActiveOrgModule();
// 	const orgScopeRef = useOrgScopeRef();
// 	const isGlobalContext = orgSlug === GLOBAL_CONTEXT_SLUG;
// 	const orgContextScope = !isGlobalContext
// 		? { scopeType: 'org' as const, scopeRef: orgScopeRef ?? '' }
// 		: undefined;

// 	return useResourcePermissions({
// 		user: { resource: RESOURCES.IDENTITY_USER, contextScope: orgContextScope },
// 		group: { resource: RESOURCES.IDENTITY_GROUP, contextScope: orgContextScope },
// 		orgUnit: { resource: RESOURCES.IDENTITY_HIERARCHY_LEVEL, contextScope: orgContextScope },
// 		// Backward-compatible alias while hierarchy-facing code is migrated.
// 		hierarchy: { resource: RESOURCES.IDENTITY_HIERARCHY_LEVEL, contextScope: orgContextScope },
// 		// Organization is domain-scoped; when in org context, force an org scope to hide it
// 		organization: { resource: RESOURCES.IDENTITY_ORGANIZATION, contextScope: orgContextScope },
// 	});
// }
