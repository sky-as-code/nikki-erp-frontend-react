export type Organization = {
	id: string;
	address: string | null;
	createdAt: Date;
	displayName: string;
	etag: string;
	legalName: string | null;
	phoneNumber: string | null;
	slug: string;
	status: string;
	updatedAt: Date | null;
};

export type SearchOrganizationsResponse = {
	items: Organization[];
	total: number;
	page: number;
	size: number;
};

export type CreateOrganizationResponse = Pick<Organization, 'id' | 'etag' | 'createdAt' | 'updatedAt'>;

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

export type DeleteOrganizationResponse = {
	slug: string;
	deletedAt: number;
};
