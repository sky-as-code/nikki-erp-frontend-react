export const RESOURCES = {
	WILDCARD: '*',
	AUTHZ_ACTION: 'AuthzAction',
	AUTHZ_ENTITLEMENT: 'AuthzEntitlement',
	AUTHZ_RESOURCE: 'AuthzResource',
	AUTHZ_ROLE: 'AuthzRole',
	AUTHZ_ROLE_SUITE: 'AuthzRoleSuite',
	AUTHZ_GRANT_REQUEST: 'AuthzGrantRequest',
	AUTHZ_REVOKE_REQUEST: 'AuthzRevokeRequest',
	IDENTITY_USER: 'IdentityUser',
	IDENTITY_GROUP: 'IdentityGroup',
	IDENTITY_ORGANIZATION: 'IdentityOrganization',
} as const;

export const ACTIONS = {
	WILDCARD: '*',
	VIEW: 'View',
	CREATE: 'Create',
	UPDATE: 'Update',
	DELETE: 'Delete',
	ADD_ENTITLEMENT: 'AddEntitlement',
	REMOVE_ENTITLEMENT: 'RemoveEntitlement',
	RESPOND_GRANT_REQUEST: 'RespondGrantRequest',
} as const;

export const RESOURCE_TO_MODULE: Record<string, string> = {
	[RESOURCES.AUTHZ_ACTION]: 'authorize',
	[RESOURCES.AUTHZ_ENTITLEMENT]: 'authorize',
	[RESOURCES.AUTHZ_RESOURCE]: 'authorize',
	[RESOURCES.AUTHZ_ROLE]: 'authorize',
	[RESOURCES.AUTHZ_ROLE_SUITE]: 'authorize',
	[RESOURCES.AUTHZ_GRANT_REQUEST]: 'authorize',
	[RESOURCES.AUTHZ_REVOKE_REQUEST]: 'authorize',
	[RESOURCES.IDENTITY_USER]: 'identity',
	[RESOURCES.IDENTITY_GROUP]: 'identity',
	[RESOURCES.IDENTITY_ORGANIZATION]: 'identity',
};
