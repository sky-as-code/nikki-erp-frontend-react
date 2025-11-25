export type User = {
	id: string;
	email: string;
	displayName: string;
	avatarUrl: string;
	password: string;
	mustChangePassword: boolean;
	etag: string;
	status: string;
	hierarchyId: string | null;
	orgId: string;
	createdAt: Date | null;
	updatedAt: Date | null;
	groups?: Array<{
		id: string;
		name: string;
		description?: string | null;
	}>;
	hierarchy?: Hierarchy;
};

export type Hierarchy = {
	id: string;
	name: string;
};

export type SearchUsersResponse = {
	items: User[];
	total: number;
	page: number;
	size: number;
};

export type CreateUserResponse = Pick<User, 'id' | 'etag' | 'createdAt' | 'updatedAt'>;

export type CreateUserRequest = Pick<User, 'displayName' | 'email' | 'password' | 'orgId'>;

export type UpdateUserRequest = Pick<User, 'id' | 'avatarUrl' | 'email' | 'displayName' | 'etag' | 'status'>;

export type UpdateUserResponse = Pick<User, 'id' | 'updatedAt' | 'etag'>;