import { Entitlement } from '../entitlements';

import type { Org } from '@/features/identities';


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
	orgDisplayName?: string;
	org?: Org;
	createdAt: string;
	createdBy: string;
	etag?: string;
	// Relations
	entitlements?: Entitlement[];
	entitlementsCount?: number;
}
