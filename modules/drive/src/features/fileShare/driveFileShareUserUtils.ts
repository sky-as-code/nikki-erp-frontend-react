import type { DriveFile } from '@/features/files/types';

import { DriveFileSharePermission, type DriveFileShare } from '@/features/fileShare/type';


export const DRIVE_FILE_OWNER_SHARE_ID = '__drive_file_owner__' as const;

export function createOwnerFileShareStub(file: DriveFile): DriveFileShare | null {
	if (!file.ownerRef) return null;
	return {
		id: DRIVE_FILE_OWNER_SHARE_ID,
		etag: '',
		driveFileRef: file.id,
		userRef: file.ownerRef,
		permission: DriveFileSharePermission.OWNER,
		createdAt: file.createdAt,
		updatedAt: file.updatedAt,
		user: file.owner,
	};
}

export type RawDriveFileShare = DriveFileShare & {
	user_ref?: string;
	userId?: string;
	user_id?: string;
};

export function resolveUserRef(share: DriveFileShare): string {
	const rawShare = share as RawDriveFileShare;
	return share.userRef ?? rawShare.user_ref ?? rawShare.userId ?? rawShare.user_id ?? '';
}

export function getUserInitials(user?: { displayName?: string; email?: string }): string {
	const source = user?.displayName?.trim() || user?.email?.trim() || '';
	if (!source) return '?';
	return source
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? '')
		.join('');
}
