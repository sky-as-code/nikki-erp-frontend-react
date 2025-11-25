export type Group = {
	id: string;
	createdAt: number;
	name: string;
	description: string | null;
	etag: string;
	orgId: string;
	org?: {
		id: string;
		displayName: string;
		slug: string;
	};
	updatedAt: number | null;
	users?: Array<{
		id: string;
		email: string;
		displayName?: string;
		avatarUrl?: string | null;
		status?: string;
	}>;
};

export type SearchGroupsResponse = {
	items: Group[];
	total: number;
	page: number;
	size: number;
};

export type CreateGroupResponse = Pick<Group, 'id' | 'etag' | 'createdAt' | 'updatedAt'>;

export type CreateGroupRequest = Pick<Group, 'name' | 'description' | 'orgId'>;

export type UpdateGroupRequest = Pick<Group, 'id' | 'name' | 'description' | 'etag'>;

export type UpdateGroupResponse = Pick<Group, 'id' | 'updatedAt' | 'etag'>;

export type ManageGroupUsersRequest = {
	groupId: string;
	add?: string[];
	remove?: string[];
	etag: string;
};

export type ManageGroupUsersResponse = {
	id: string;
	etag: string;
	updatedAt: number;
};
