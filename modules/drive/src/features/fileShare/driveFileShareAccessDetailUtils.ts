import { PERMISSION_RANK } from '@/features/fileShare/sharePermissionConstants';
import {
	DriveFileSharePermission,
	type DriveFileShare,
	type DriveFileSharePermission as DriveFileSharePermissionType,
} from '@/features/fileShare/type';



const ASSIGNABLE_PERMISSIONS: DriveFileSharePermissionType[] = [
	DriveFileSharePermission.VIEW,
	DriveFileSharePermission.EDIT,
	DriveFileSharePermission.EDIT_TRASH,
];

export function getAssignableOptions(
	allOptions: Array<{ value: DriveFileSharePermissionType; label: string }>,
	maxInheritedPermission: DriveFileSharePermissionType | null,
): Array<{ value: DriveFileSharePermissionType; label: string }> {
	const minRank = maxInheritedPermission
		? PERMISSION_RANK[maxInheritedPermission] ?? 0
		: 0;
	return allOptions.filter(
		(o) => ASSIGNABLE_PERMISSIONS.includes(o.value)
			&& (PERMISSION_RANK[o.value] ?? 0) > minRank,
	);
}

export function mapDirectToInheritedPermission(
	permission: DriveFileSharePermissionType,
): DriveFileSharePermissionType | null {
	switch (permission) {
		case DriveFileSharePermission.VIEW:
			return DriveFileSharePermission.INHERITED_VIEW;
		case DriveFileSharePermission.EDIT:
			return DriveFileSharePermission.INHERITED_EDIT;
		case DriveFileSharePermission.EDIT_TRASH:
			return DriveFileSharePermission.INHERITED_EDIT_TRASH;
		case DriveFileSharePermission.OWNER:
			return DriveFileSharePermission.ANCESTOR_OWNER;
		default:
			return null;
	}
}

export function orderSharesForAccessDetail(
	items: DriveFileShare[],
	currentFileId: string,
): DriveFileShare[] {
	const reversed = [...items].reverse();
	const idx = reversed.findIndex((s) => s.driveFileRef === currentFileId);
	if (idx <= 0) return reversed;
	const next = [...reversed];
	const [hit] = next.splice(idx, 1);
	return [hit, ...next];
}

export function isDirectPermission(permission: DriveFileSharePermissionType): boolean {
	return ASSIGNABLE_PERMISSIONS.includes(permission);
}
