import { Resource } from '../resources';


interface Action {
	id: string;
	name: string;
	resourceId: string;
	description?: string;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	// Relations
	resource?: Resource;
	entitlementsCount?: number;
}

export type { Action };