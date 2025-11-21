import { OwnerType, Role } from '../roles';


interface RoleSuite {
	id: string;
	name: string;
	description?: string;
	ownerType: OwnerType;
	ownerRef: string;
	isRequestable: boolean;
	isRequiredAttachment: boolean;
	isRequiredComment: boolean;
	orgId: string;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	// Relations
	roles?: Role[];
	rolesCount?: number;
	// Display info
	ownerName?: string;
}

export type { RoleSuite };