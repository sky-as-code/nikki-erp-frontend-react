import * as request from '@nikkierp/common/request';


export type User = {
	id: string;
	email: string;
	displayName: string;
};

export type Module = {
	id: string;
	name: string;
	slug: string;
};

export type Organization = {
	id: string;
	name: string;
	slug: string;
	modules: Module[];
};

export type EntitlementAssignment = {
	entitlement: string;
	scopeType: string;
	scopeRef: string;
};

export type UserContext = {
	user: User;
	orgs: Organization[];
	permissions: EntitlementAssignment[];
};

type OrganizationApiResponse = {
	id: string;
	displayName: string;
	slug: string;
	status: string;
	legalName: string | null;
	address: string | null;
	phoneNumber: string | null;
	etag: string;
	createdAt: number;
	updatedAt: number | null;
};

type SearchOrganizationsResponse = {
	items: OrganizationApiResponse[];
	total: number;
	page: number;
	size: number;
};

export class UserContextService {
	public async fetch(): Promise<UserContext> {
		try {
			const orgResponse = await request.get<SearchOrganizationsResponse>('identity/organizations');
			const defaultModules: Module[] = [
				{
					id: '1',
					name: 'Essential',
					slug: 'essential',
				},
				{
					id: '2',
					name: 'Identity',
					slug: 'identity',
				},
			];

			const orgs: Organization[] = orgResponse.items.map(org => ({
				id: org.id,
				name: org.displayName,
				slug: org.slug,
				modules: defaultModules,
			}));

			return {
				user: {
					id: '01JWNNJGS70Y07MBEV3AQ0M526',
					email: 'system@nikki.com',
					displayName: 'System',
				},
				orgs,
				permissions: [],
			};
		}
		catch (error) {
			console.error('Failed to fetch user context:', error);
			// Return empty context on error
			return {
				user: {
					id: '1',
					email: 'test@test.com',
					displayName: 'Test User',
				},
				orgs: [],
				permissions: [],
			};
		}
	}
}

export const userContextService = new UserContextService();