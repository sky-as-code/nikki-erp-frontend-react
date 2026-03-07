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
	[RESOURCES.IDENTITY_HIERARCHY_LEVEL]: 'identity',
	[RESOURCES.INVENTORY_PRODUCT]: 'inventory',
};

export const SYSTEM_CONTEXT_RESOURCES: string[] = [
	RESOURCES.AUTHZ_RESOURCE,
	RESOURCES.AUTHZ_ACTION,
	RESOURCES.AUTHZ_ENTITLEMENT,
	RESOURCES.IDENTITY_ORGANIZATION,
];

export const ACTIONS_FOR_SYSTEM_CONTEXT = [
	ACTIONS.VIEW,
	ACTIONS.CREATE,
	ACTIONS.UPDATE,
	ACTIONS.DELETE,
];

export type ModuleAccessMode = 'strict_context' | 'any_scope';

export const MODULE_ACCESS_POLICY: Record<string, ModuleAccessMode> = {
	authorize: 'any_scope',
	identity: 'strict_context',
};
