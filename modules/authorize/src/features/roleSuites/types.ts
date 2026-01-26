
import type { Org } from '@/features/identities';
import type { Role } from '@/features/roles';

import { OwnerType } from '@/features/roles';


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
	orgDisplayName?: string;
	org?: Org;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	etag?: string;
	// Relations
	roles?: Role[];
	roleIds?: string[];
	rolesCount?: number;
	// Display info
	ownerName?: string;
}

export type { RoleSuite };