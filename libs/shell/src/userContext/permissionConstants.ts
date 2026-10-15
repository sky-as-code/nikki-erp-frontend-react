// Legacy PascalCase codes still read by the authorize micro-app. Module access is decided by
// `canAccessModule` (@nikkierp/common/entitlements) from the backend model prefix instead.
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
	IDENTITY_HIERARCHY_LEVEL: 'IdentityHierarchyLevel',
	INVENTORY_PRODUCT: 'InventoryProduct',
} as const;

export const ACTIONS = {
	WILDCARD: '*',
	VIEW: 'View',
	CREATE: 'Create',
	UPDATE: 'Update',
	DELETE: 'Delete',
	ADD_ENTITLEMENT: 'AddEntitlement',
	REMOVE_ENTITLEMENT: 'RemoveEntitlement',
	RESPOND: 'Respond',
} as const;
