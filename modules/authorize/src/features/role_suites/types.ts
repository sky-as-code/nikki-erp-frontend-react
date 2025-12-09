import { OwnerType } from '@/features/roles';

import type { Role } from '@/features/roles';


interface RoleSuite {
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
	roles?: Role[];
	rolesCount?: number;
	// Display info
	ownerName?: string;
}

export type { RoleSuite };