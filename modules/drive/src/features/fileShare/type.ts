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

/** Khớp `DriveFileShareFileDto` từ BE (metadata file gắn với share). */
export interface DriveFileShareFileDto {
	id: string;
	name: string;
	isFolder: boolean;
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
	file?: DriveFileShareFileDto;
}

export const DriveFileSharePermission = {
	VIEW: 'view',
	EDIT: 'edit',
	EDIT_TRASH: 'edit-trash',
	INHERITED_VIEW: 'inherited-view',
	INHERITED_EDIT: 'inherited-edit',
	INHERITED_EDIT_TRASH: 'inherited-edit-trash',
	ANCESTOR_OWNER: 'ancestor-owner',
	OWNER: 'owner',
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

export type GetDriveFileShareAncestorsResponse = DriveFileShare[];

export type ResolvedDriveFileShareRequest = ListQuery;
export type ResolvedDriveFileShareResponse = ListResponse<DriveFileShare>;

export type GetDriveFileSharesByUserResponse = DriveFileShare[];

export type ListShareUsersRequest = Pick<ListQuery, 'page' | 'size' | 'graph'> & {
	q?: string;
};

export type { DriveFileShare };