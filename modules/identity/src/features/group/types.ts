import {
	CreateResponse,
	DeleteResponse,
	ManageMembersRequest,
	ManageMembersResponse,
	SearchResponse,
	UpdateResponse,
} from '@nikkierp/ui/types';


export type Group = {
	id: string;
	createdAt: Date;
	name: string;
	description?: string;
	etag: string;
	org?: {
		id: string;
		displayName: string;
		slug: string;
	};
	updatedAt?: Date;
	users?: Array<{
		id: string;
		email: string;
		displayName?: string;
		avatarUrl?: string;
		status?: string;
	}>;
};

export type CreateGroupRequest = {
	name: string;
	description?: string;
	orgId: string;
};

export type UpdateGroupRequest = {
	id: string;
	etag: string;
	name?: string;
	description?: string;
};

export type SearchGroupsResponse = SearchResponse<Group>;

export type CreateGroupResponse = CreateResponse;

export type UpdateGroupResponse = UpdateResponse;

export type ManageGroupUsersRequest = ManageMembersRequest;

export type ManageGroupUsersResponse = ManageMembersResponse;

export type DeleteGroupResponse = DeleteResponse;