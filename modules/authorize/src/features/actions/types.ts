import { Resource } from '@/features/resources/types';


interface Action {
	id: string;
	name: string;
	resourceId: string;
	description?: string;
	etag: string;
	createdAt: string;
	createdBy: string;
	resource?: Resource;
	entitlementsCount?: number;
}

export type { Action };