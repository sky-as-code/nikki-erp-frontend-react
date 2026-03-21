import {
	CreateResponse,
	DeleteResponse,
	ListQuery,
	ListResponse,
	UpdateResponse,
} from '@nikkierp/common';


export interface ShareUser {
	id: string;
	displayName: string;
	email: string;
	avatarUrl?: string;
}

interface DriveFileShare {
	id: string;
	etag: string;
	driveFileRef: string;
	userRef: string;
	permission: DriveFileSharePermission;
	createdAt: Date;
	updatedAt: Date;
	user?: ShareUser;
}

export const DriveFileSharePermission = {
	VIEW: 'view',
	EDIT: 'edit',
	EDIT_TRASH: 'edit-trash',
} as const;

export type DriveFileSharePermission = typeof DriveFileSharePermission[keyof typeof DriveFileSharePermission];

export type CreateDriveFileShareRequest = Pick<DriveFileShare,
'driveFileRef' | 'userRef' | 'permission'>;
export type CreateDriveFileShareResponse = CreateResponse;

export type CreateDriveFileShareBulkRequest = {
	userRefs: string[];
} & Pick<DriveFileShare, 'driveFileRef' | 'permission'>;
export type CreateDriveFileShareBulkResponse = CreateResponse[];

export type UpdateDriveFileShareRequest = Pick<DriveFileShare, 'etag' | 'permission'>;
export type UpdateDriveFileShareResponse = UpdateResponse;

export type DeleteDriveFileShareResponse = DeleteResponse;

export type GetDriveFileShareResponse = DriveFileShare;

export type SearchDriveFileShareRequest = ListQuery;
export type SearchDriveFileShareResponse = ListResponse<DriveFileShare>;

export type ListShareUsersRequest = Pick<ListQuery, 'page' | 'size' | 'graph'> & {
	q?: string;
};

export type { DriveFileShare };