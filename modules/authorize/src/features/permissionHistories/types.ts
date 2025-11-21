import { Entitlement } from '../entitlements';
import { Role } from '../roles';
import { RoleSuite } from '../roleSuite';


export enum PermissionEffect {
	GRANT = 'grant',
	REVOKE = 'revoke',
}

export enum PermissionChangeReason {
	// Entitlement
	ENT_ADDED = 'ent_added',
	ENT_REMOVED = 'ent_removed',
	ENT_DELETED = 'ent_deleted',
	ENT_UPDATED = 'ent_updated',
	// Role
	ROLE_ADDED = 'role_added',
	ROLE_REMOVED = 'role_removed',
	ROLE_DELETED = 'role_deleted',
	ROLE_UPDATED = 'role_updated',
	// Suite
	SUITE_ADDED = 'suite_added',
	SUITE_REMOVED = 'suite_removed',
	SUITE_DELETED = 'suite_deleted',
	SUITE_UPDATED = 'suite_updated',
	// Request
	REQUEST_GRANTED = 'request_granted',
	REQUEST_REVOKED = 'request_revoked',
	REQUEST_CANCELLED = 'request_cancelled',
	// Manual
	MANUAL_GRANT = 'manual_grant',
	MANUAL_REVOKE = 'manual_revoke',
	// Other
	USER_REMOVED = 'user_removed',
	USER_DEACTIVATED = 'user_deactivated',
	ORG_REMOVED = 'org_removed',
	HIERARCHY_REMOVED = 'hierarchy_removed',
	GROUP_REMOVED = 'group_removed',
	SYSTEM_CLEANUP = 'system_cleanup',
	ADMIN_OVERRIDE = 'admin_override',
}


interface PermissionHistory {
	id: string;
	effect: PermissionEffect;
	reason: PermissionChangeReason;
	approverId?: string;
	approverName?: string;
	receiverId: string;
	receiverName: string;
	entitlementId?: string;
	roleId?: string;
	roleSuiteId?: string;
	grantRequestId?: string;
	revokeRequestId?: string;
	metadata?: Record<string, unknown>;
	createdAt: string;
	// Relations
	entitlement?: Entitlement;
	role?: Role;
	roleSuite?: RoleSuite;
}

export type { PermissionHistory };
