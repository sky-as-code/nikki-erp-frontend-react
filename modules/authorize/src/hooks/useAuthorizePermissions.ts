import { ACTIONS, RESOURCES, useResourcePermissions } from '@nikkierp/shell/userContext';


export function useAuthorizePermissions() {
	return useResourcePermissions({
		resource: { resource: RESOURCES.AUTHZ_RESOURCE },
		action: { resource: RESOURCES.AUTHZ_ACTION },
		entitlement: { resource: RESOURCES.AUTHZ_ENTITLEMENT },
		role: {
			resource: RESOURCES.AUTHZ_ROLE,
			customActions: {
				canAddEntitlement: ACTIONS.ADD_ENTITLEMENT,
				canRemoveEntitlement: ACTIONS.REMOVE_ENTITLEMENT,
			},
		},
		roleSuite: { resource: RESOURCES.AUTHZ_ROLE_SUITE },
		grantRequest: {
			resource: RESOURCES.AUTHZ_GRANT_REQUEST,
			customActions: {
				canRespond: ACTIONS.RESPOND_GRANT_REQUEST,
			},
		},
		revokeRequest: { resource: RESOURCES.AUTHZ_REVOKE_REQUEST },
	});
}
