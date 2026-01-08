export type HierarchyLevel = {
	id: string;
	createdAt: number;
	name: string;
	etag: string;
	children?: HierarchyLevel[];
	parent?: {
		id: string;
		name: string;
	};
	updatedAt: number | null;
};

export type SearchHierarchyLevelsResponse = {
	items: HierarchyLevel[];
	total: number;
	page: number;
	size: number;
};

export type CreateHierarchyLevelResponse = Pick<HierarchyLevel, 'id' | 'etag' | 'createdAt' | 'updatedAt'>;

export type CreateHierarchyLevelRequest = Pick<HierarchyLevel, 'name'> & {
	parentId?: string;
};

export type UpdateHierarchyLevelRequest = {
	id: string;
	name?: string;
	etag: string;
	parentId?: string;
};

export type DeleteHierarchyLevelRequest = {
	id: string;
	etag: string;
};

export type ManageHierarchyUsersRequest = {
	hierarchyId: string;
	add?: string[];
	remove?: string[];
	etag: string;
};

export type ManageHierarchyUsersResponse = {
	id: string;
	etag: string;
	updatedAt: number;
};