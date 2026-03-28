import { DriveFilePermission, type DriveFilePermission as DriveFilePermissionType } from '../types';

import {
	PERMISSION_SUMMARY_ROWS,
	SHARE_PERMISSION_INFO_ORDER,
	type PermissionSummaryCellKind,
	type PermissionSummaryRowKey,
} from '@/features/fileShare/sharePermissionConstants';


/**
 * Các action tương ứng với menu trong {@link FileActionMenu} (hook `useDriveFileActions`).
 * Không gồm `previewFile` / `create` vì không xuất hiện trong menu hiện tại.
 */
export type FileMenuActionKey =
	| 'info'
	| 'openFolder'
	| 'download'
	| 'editMetadata'
	| 'share'
	| 'moveToTrash'
	| 'restore'
	| 'restoreTo'
	| 'deletePermanently';

/**
 * Map action menu → dòng trong bảng `PERMISSION_SUMMARY_ROWS` (modal trợ giúp quyền share).
 * `share` không map vào bảng — tạm không phân quyền theo `resolvedPermission` (xử lý trong `canPerformMenuActionFromGuide`).
 */
const MENU_ACTION_TO_PERMISSION_ROW: Partial<
	Record<FileMenuActionKey, PermissionSummaryRowKey>
> = {
	info: 'view',
	openFolder: 'view',
	download: 'view',
	editMetadata: 'edit',
	moveToTrash: 'moveToTrash',
	restore: 'restore',
	restoreTo: 'restore',
	deletePermanently: 'deletePermanently',
};

/** Cột bảng trợ giúp trùng thứ tự chuỗi với `DriveFilePermission` (trừ `none`). */
function permissionColumnIndex(permission: DriveFilePermissionType | undefined): number | null {
	if (permission === undefined || permission === DriveFilePermission.NONE) return null;
	const idx = SHARE_PERMISSION_INFO_ORDER.indexOf(
		permission as (typeof SHARE_PERMISSION_INFO_ORDER)[number],
	);
	return idx >= 0 ? idx : null;
}

function getCell(
	rowKey: PermissionSummaryRowKey,
	columnIndex: number,
): PermissionSummaryCellKind | undefined {
	const row = PERMISSION_SUMMARY_ROWS.find((r) => r.rowKey === rowKey);
	return row?.cells[columnIndex];
}

/** `folderOnly` / `fileOrChild` được coi là được phép (theo nghĩa bảng trợ giúp), không phải `na`. */
function cellAllows(cell: PermissionSummaryCellKind | undefined): boolean {
	if (cell === undefined) return false;
	return cell !== 'na';
}

/**
 * Với `resolvedPermission` (cùng giá trị chuỗi với cột trong `SHARE_PERMISSION_INFO_ORDER`),
 * suy ra được hành động menu từ bảng `PERMISSION_SUMMARY_ROWS` (ô khác `na` = được phép).
 *
 * - `share`: chưa có dòng trong guide → tạm luôn `true` (khoan phân quyền).
 * - Các action còn lại: đọc ô tại cột permission × dòng tương ứng; `none`/thiếu cột → `false`.
 */
export function canPerformMenuActionFromGuide(
	permission: DriveFilePermissionType | undefined,
	action: FileMenuActionKey,
): boolean | null {
	if (action === 'share') return true;
	const rowKey = MENU_ACTION_TO_PERMISSION_ROW[action];
	if (!rowKey) return null;
	const col = permissionColumnIndex(permission);
	if (col === null) return false;
	const cell = getCell(rowKey, col);
	return cellAllows(cell);
}
