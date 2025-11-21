import { Action } from '../actions';


export enum ResourceType {
	NIKKI_APPLICATION = 'nikki_application',
	CUSTOM = 'custom',
}

export enum ScopeType {
	DOMAIN = 'domain',
	ORG = 'org',
	HIERARCHY = 'hierarchy',
	PRIVATE = 'private',
}

interface Resource {
	id: string;
	name: string;
	description?: string;
	resourceType: ResourceType;
	resourceRef?: string; // ULID reference to actual object
	scopeType: ScopeType;
	scopeRef?: string;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	etag?: string;
	// Relations
	actions?: Action[];
	actionsCount?: number;
}

export type { Resource };
