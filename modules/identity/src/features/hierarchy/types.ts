import {
	CreateResponse,
	DeleteResponse,
	ManageMembersRequest,
	ManageMembersResponse,
	SearchResponse,
	UpdateResponse,
} from '@nikkierp/common';


export type HierarchyLevel = {
	id: string;
	createdAt: Date;
	name: string;
	etag: string;
	children?: HierarchyLevel[];
	parent?: {
		id: string;
		name: string;
	};
	updatedAt?: Date;
};

export type CreateHierarchyLevelRequest = {
	name: string;
	parentId?: string;
	orgId: string;
};

export type UpdateHierarchyLevelRequest = {
	id: string;
	etag: string;
	name?: string;
	parentId?: string;
};


export type SearchHierarchyLevelResponse = SearchResponse<HierarchyLevel>;

export type CreateHierarchyLevelResponse = CreateResponse;

export type UpdateHierarchyLevelResponse = UpdateResponse;

export type ManageHierarchyLevelUsersRequest = ManageMembersRequest;

export type ManageHierarchyLevelUsersResponse = ManageMembersResponse;

export type DeleteHierarchyLevelResponse = DeleteResponse;