import {
	CreateResponse,
	DeleteResponse,
	UpdateResponse,
} from '@nikkierp/common';


interface DriveFile {
	id: string;
	etag: string;

	ownerRef: string;
	parentDriveFileRef: string;
	name: string;
	mime: string;
	type: DriveFileType;
	isFolder: boolean;
	size: number;
	visibility: DriveFileVisibility;
	status: DriveFileStatus;
	children: Array<DriveFile>;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export const DriveFileVisibility = {
	PUBLIC: 'public',
	OWNER: 'owner',
	SHARED: 'shared',
} as const;

export type DriveFileVisibility =
	typeof DriveFileVisibility[keyof typeof DriveFileVisibility];

export const DriveFileStatus = {
	ACTIVE: 'active',
	IN_TRASH: 'in-trash',
	PARENT_IN_TRASH: 'parent-in-trash',
} as const;

export type DriveFileStatus = typeof DriveFileStatus[keyof typeof DriveFileStatus];

export const DriveFileType = {
	FOLDER: 'folder',
	IMAGE: 'image',
	VIDEO: 'video',
	AUDIO: 'audio',
	DOCUMENT: 'document',
	SPREADSHEET: 'spreadsheet',
	PRESENTATION: 'presentation',
	PDF: 'pdf',
	TEXT: 'text',
	CODE: 'code',
	ARCHIVE: 'archive',
	OTHER: 'other',
} as const;

export type DriveFileType = typeof DriveFileType[keyof typeof DriveFileType];

export type DriveFileStatusBadge = { label: string; color: string };

export function getDriveFileStatusBadge(
	status: DriveFileStatus,
): DriveFileStatusBadge {
	const isInTrash =
		status === DriveFileStatus.IN_TRASH ||
		status === DriveFileStatus.PARENT_IN_TRASH;
	return isInTrash
		? { label: 'In trash', color: 'gray' }
		: { label: 'Active', color: 'green' };
}

export type ListResponse<T> = {
	total: number;
	items: T[];
};

export type ListQuery = {
	page?: number;
	size?: number;
	graph?: Record<string, unknown>;
};

export type CreateDriveFileRequest = Omit<
	DriveFile,
	'id' | 'etag' | 'children' | 'deletedAt'
>;
export type CreateDriveFileResponse = CreateResponse;

export type UpdateDriveFileMetadataRequest = Pick<
	DriveFile,
	'etag' | 'name' | 'visibility'
>;
export type UpdateDriveFileMetadataResponse = UpdateResponse;

export type DeleteDriveFileResponse = DeleteResponse;

export type MoveDriveFileToTrashResponse = UpdateResponse;

export type RestoreDriveFileFromTrashResponse = UpdateResponse;

export type GetDriveFileResponse = DriveFile;

export type GetDriveFileAncestorsResponse = Array<DriveFile>;

export type GetDriveFileByParentRequest = ListQuery;
export type GetDriveFileByParentResponse = ListResponse<DriveFile>;

export type SearchDriveFileByParentRequest = ListQuery;
export type SearchDriveFileByParentResponse = ListResponse<DriveFile>;

/** File selector widget: pick files or folders only */
export type FileSelectorMode = 'file' | 'folder';

export type { DriveFile };
