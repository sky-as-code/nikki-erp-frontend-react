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

export type GetUserByIdResponse = {
	id: string;
	email: string;
	displayName: string;
	orgs: {
		id: string;
		displayName: string;
		slug: string;
	}[];
};

/* eslint-disable max-lines-per-function */
export class UserContextService {
	public async fetch(userId: string): Promise<UserContext> {
		try {
			const response = await request.get<GetUserByIdResponse>(`identity/users/${userId}`, {
				searchParams: {
					withOrg: 'true',
				},
			});

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
				{
					id: '3',
					name: 'Authorize',
					slug: 'authorize',
				}
			];

			const orgs: Organization[] = response.orgs.map(org => ({
				id: org.id,
				name: org.displayName,
				slug: org.slug,
				modules: defaultModules,
			}));

			return {
				user: {
					id: response.id,
					email: response.email,
					displayName: response.displayName,
				},
				orgs,
				permissions: [],
			};
		}
		catch (error) {
			console.error('Failed to fetch user context:', error);
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
