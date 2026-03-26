import {
	DriveFileSharePermission,
	type DriveFileSharePermission as DriveFileSharePermissionType,
} from '@/features/fileShare/type';


/**
 * Thứ tự cột quyền trong bảng trợ giúp / mapping `resolvedPermission` → ô trong `PERMISSION_SUMMARY_ROWS`.
 * Một nguồn duy nhất — `PERMISSION_RANK` suy ra từ đây.
 */
export const SHARE_PERMISSION_INFO_ORDER: DriveFileSharePermissionType[] = [
	DriveFileSharePermission.VIEW,
	DriveFileSharePermission.INHERITED_VIEW,
	DriveFileSharePermission.EDIT,
	DriveFileSharePermission.INHERITED_EDIT,
	DriveFileSharePermission.EDIT_TRASH,
	DriveFileSharePermission.INHERITED_EDIT_TRASH,
	DriveFileSharePermission.OWNER,
	DriveFileSharePermission.ANCESTOR_OWNER,
];

/** So sánh “mạnh hơn” theo cùng thứ tự với {@link SHARE_PERMISSION_INFO_ORDER} (1 = yếu nhất). */
export const PERMISSION_RANK: Record<DriveFileSharePermissionType, number> = Object.fromEntries(
	SHARE_PERMISSION_INFO_ORDER.map((perm, index) => [perm, index + 1]),
) as Record<DriveFileSharePermissionType, number>;

export type PermissionSummaryCellKind = 'yes' | 'na' | 'folderOnly' | 'fileOrChild';

export type PermissionSummaryRowKey =
	| 'view'
	| 'edit'
	| 'createInside'
	| 'moveToTrash'
	| 'restore'
	| 'deletePermanently';

/** Mỗi hàng: `cells[i]` tương ứng cột `SHARE_PERMISSION_INFO_ORDER[i]`. */
export const PERMISSION_SUMMARY_ROWS: { rowKey: PermissionSummaryRowKey; cells: PermissionSummaryCellKind[] }[] = [
	{ rowKey: 'view', cells: ['yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes'] },
	{ rowKey: 'edit', cells: ['na', 'na', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes'] },
	{
		rowKey: 'createInside',
		cells: ['na', 'na', 'folderOnly', 'folderOnly', 'folderOnly', 'folderOnly', 'folderOnly', 'folderOnly'],
	},
	{ rowKey: 'moveToTrash', cells: ['na', 'na', 'na', 'na', 'fileOrChild', 'yes', 'yes', 'yes'] },
	{ rowKey: 'restore', cells: ['na', 'na', 'na', 'na', 'fileOrChild', 'yes', 'yes', 'yes'] },
	{ rowKey: 'deletePermanently', cells: ['na', 'na', 'na', 'na', 'na', 'na', 'yes', 'yes'] },
];
