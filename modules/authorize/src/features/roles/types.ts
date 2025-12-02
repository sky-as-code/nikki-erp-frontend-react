import { Entitlement } from '../entitlements';


export enum OwnerType {
	USER = 'user',
	GROUP = 'group',
}

export interface Role {
	id: string;
	name: string;
	description?: string;
	ownerType: OwnerType;
	ownerRef: string;
	isRequestable: boolean;
	isRequiredAttachment: boolean;
	isRequiredComment: boolean;
	orgId?: string;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	etag?: string;
	// Relations
	entitlements?: Entitlement[];
	entitlementsCount?: number;
	assignmentsCount?: number;
	suitesCount?: number;
	// Display info
	ownerName?: string;
}
