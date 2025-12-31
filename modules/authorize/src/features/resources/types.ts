import type { Action } from '@/features/actions';


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
	resourceRef?: string; // ID reference to actual object
	scopeType: ScopeType;
	createdAt: string;
	etag: string;
	// Relations
	actions?: Action[];
	actionsCount?: number;
}

export type { Resource };
