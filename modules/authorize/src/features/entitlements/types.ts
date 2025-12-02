import { Action } from '../actions';
import { Resource } from '../resources';
import { Role } from '../roles';


export enum SubjectType {
	NIKKI_USER = 'nikki_user',
	NIKKI_GROUP = 'nikki_group',
	NIKKI_ROLE = 'nikki_role',
	CUSTOM = 'custom',
}

interface Entitlement {
	id: string;
	name: string;
	actionId?: string;
	actionExpr: string;
	resourceId?: string;
	description?: string;
	etag: string;
	orgId?: string;
	createdAt: string;
	createdBy: string;
	// Relations
	action?: Action;
	resource?: Resource;
	assignmentsCount?: number;
	rolesCount?: number;
}

interface EntitlementAssignment {
	id: string;
	subjectType: SubjectType;
	subjectRef: string;
	entitlementId: string;
	actionName: string;
	resourceName: string;
	resolvedExpr?: string;
	scopeRef?: string;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	// Relations
	entitlement?: Entitlement;
	roleId?: string;
	role?: Role;
	// Display info
	subjectName?: string;
}

export type {
	Entitlement,
	EntitlementAssignment,
};
