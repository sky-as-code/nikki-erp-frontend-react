import { resolveUserRef } from '@/features/fileShare/driveFileShareUserUtils';
import { PERMISSION_RANK } from '@/features/fileShare/sharePermissionConstants';
import {
	DriveFileSharePermission,
	type DriveFileShare,
	type DriveFileSharePermission as DriveFileSharePermissionType,
} from '@/features/fileShare/type';


export type ShareDetailListLayer = 'owner' | 'viewer' | 'inherited' | 'resolved';

/**
 * Có hiện nút xem chi tiết trên một dòng share trong panel.
 * - Lớp owner: không mở chi tiết.
 * - Lớp viewer: luôn xem được quyền của chính mình.
 * - Lớp inherited/resolved: chủ file, chủ folder cha (ANCESTOR_OWNER trên file), hoặc chính user của dòng đó.
 */
export function canOpenShareDetailRow(params: {
	file: Pick<{ ownerRef: string }, 'ownerRef'>;
	share: DriveFileShare;
	currentUserId: string | undefined;
	layer: ShareDetailListLayer;
	viewerAppliedPermission?: DriveFileSharePermissionType | null;
}): boolean {
	const { file, share, currentUserId, layer, viewerAppliedPermission } = params;
	if (!currentUserId) return false;
	if (layer === 'owner') return false;
	if (layer === 'viewer') return true;
	if (share.permission === DriveFileSharePermission.OWNER) return false;
	if (file.ownerRef === currentUserId) return true;
	if (resolveUserRef(share) === currentUserId) return true;
	if (viewerAppliedPermission === DriveFileSharePermission.ANCESTOR_OWNER) return true;
	return false;
}

/** Chỉ chủ file hoặc chủ folder cha (quyền ANCESTOR_OWNER trên file) mới cập nhật / thu hồi trong modal chi tiết. */
export function canManageShareInDetail(params: {
	file: Pick<{ ownerRef: string }, 'ownerRef'>;
	currentUserId: string | undefined;
	viewerAppliedPermission?: DriveFileSharePermissionType | null;
}): boolean {
	const { file, currentUserId, viewerAppliedPermission } = params;
	if (!currentUserId) return false;
	if (file.ownerRef === currentUserId) return true;
	if (viewerAppliedPermission === DriveFileSharePermission.ANCESTOR_OWNER) return true;
	return false;
}



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

export const INHERITED_PERMISSIONS: Partial<Record<DriveFileSharePermission, DriveFileSharePermission>> = {
	[DriveFileSharePermission.VIEW]: DriveFileSharePermission.INHERITED_VIEW,
	[DriveFileSharePermission.EDIT]: DriveFileSharePermission.INHERITED_EDIT,
	[DriveFileSharePermission.EDIT_TRASH]: DriveFileSharePermission.INHERITED_EDIT_TRASH,
	[DriveFileSharePermission.OWNER]: DriveFileSharePermission.ANCESTOR_OWNER,
};

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
