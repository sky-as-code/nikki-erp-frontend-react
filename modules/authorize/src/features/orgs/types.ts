export interface Org {
	id: string;
	displayName: string;
	legalName?: string;
	email?: string;
	phoneNumber?: string;
	address?: string;
	status: 'active' | 'archived';
	slug: string;
	etag?: string;
	createdAt?: string;
	updatedAt?: string;
	deletedAt?: string;
}

// Alias for convenience
export type { Org as Organization };

