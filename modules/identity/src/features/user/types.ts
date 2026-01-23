import {
	CreateResponse,
	DeleteResponse,
	SearchResponse,
	UpdateResponse,
} from '@nikkierp/common';


export type User = {
	id: string;
	email: string;
	displayName: string;
	avatarUrl?: string;
	etag: string;
	status: string;
	createdAt: Date;
	updatedAt?: Date;
	groups?: Array<{
		id: string;
		name: string;
		description?: string;
	}>;
	hierarchy?: {
		id: string;
		name: string;
	};
};

export type CreateUserRequest = {
	email: string;
	displayName: string;
	password: string;
	orgId: string;
};

export type UpdateUserRequest = {
	id: string;
	avatarUrl?: string;
	displayName?: string;
	etag: string;
	status?: string;
};

export type SearchUserResponse = SearchResponse<User>;

export type CreateUserResponse = CreateResponse;

export type UpdateUserResponse = UpdateResponse;

export type DeleteUserResponse = DeleteResponse;