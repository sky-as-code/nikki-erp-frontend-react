import {
	CreateResponse,
	DeleteResponse,
	ManageMembersRequest,
	ManageMembersResponse,
	SearchResponse,
	UpdateResponse,
} from '@nikkierp/ui/types';


export type Organization = {
	id: string;
	address?: string;
	createdAt: Date;
	displayName: string;
	etag: string;
	legalName?: string;
	phoneNumber?: string;
	slug: string;
	status: string;
	updatedAt?: Date;
};

export type CreateOrganizationRequest = {
	address?: string;
	displayName: string;
	legalName?: string;
	phoneNumber?: string;
	slug: string;
};

export type UpdateOrganizationRequest = {
	slug: string;
	address?: string;
	displayName?: string;
	etag: string;
	legalName?: string;
	phoneNumber?: string;
	newSlug?: string;
	statusId?: string;
	statusValue?: string;
};


export type SearchOrganizationResponse = SearchResponse<Organization>;

export type CreateOrganizationResponse = CreateResponse;

export type UpdateOrganizationResponse = UpdateResponse;

export type ManageOrganizationUsersRequest = ManageMembersRequest;

export type ManageOrganizationUsersResponse = ManageMembersResponse;

export type DeleteOrganizationResponse = DeleteResponse;