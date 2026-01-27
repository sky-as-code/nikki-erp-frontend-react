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

export type PermissionScopeType = 'domain' | 'org' | 'hierarchy' | 'private';

export type PermissionScopeEntry = {
	scopeType: PermissionScopeType;
	scopeRef: string;
	actions: string[];
};

export type PermissionsSnapshot = Record<string, PermissionScopeEntry[]>;

export type UserContext = {
	user: User;
	orgs: Organization[];
	permissions: PermissionsSnapshot;
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
			const orgs: Organization[] = orgResponse.items.map(org => ({
				id: org.id,
				name: org.displayName,
				slug: org.slug,
				modules: defaultModules,
			}));

			// Mock permissions for testing until BE is wired.
			const mock = MOCK_USER_CONTEXTS[MOCK_USER_INDEX];

			return {
				user: {
					id: mock.userId,
					email: mock.email,
					displayName: mock.displayName,
				},
				orgs,
				permissions: mock.permissions,
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
				permissions: {},
			};
		}
	}
}

export const userContextService = new UserContextService();


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
	},
	{
		id: '4',
		name: 'Vending Machine',
		slug: 'vending-machine',
	},
];

const MOCK_USER_INDEX = 0;

const MOCK_USER_CONTEXTS: Array<{
	userId: string;
	email: string;
	displayName: string;
	permissions: PermissionsSnapshot;
}> = [
	// {
	// 	userId: '01JWNNJGS70Y07MBEV3AQ0M526',
	// 	email: 'system@nikki.com',
	// 	displayName: 'Owner',
	// 	permissions: {
	// 		'*': [
	// 			{
	// 				scopeType: 'domain',
	// 				scopeRef: '',
	// 				actions: ['*'],
	// 			},
	// 		],
	// 	},
	// },
	{
		userId: '01JWNNJGS70Y07MBEV3AQ0M526',
		email: 'user@nikki.com',
		displayName: 'Thần sức mạnh bị xích',
		permissions: {
			AuthzEntitlement: [
				{
					scopeType: 'domain',
					scopeRef: '',
					actions: ['View'],
				},
			],
			AuthzResource: [
				{
					scopeType: 'domain',
					scopeRef: '',
					actions: ['View'],
				},
			],
			AuthzRoleSuite: [
				{
					scopeType: 'domain',
					scopeRef: '',
					actions: ['View'],
				},
			],
			IdentityGroup: [
				{
					scopeType: 'org',
					scopeRef: '01K02G6J1CYAN9K8V4PAGSQ5Z8',
					actions: ['View'],
				},
			],
			IdentityUser: [
				{
					scopeType: 'hierarchy',
					scopeRef: '01JWNY20G23KD4RV5VWYABQYH1',
					actions: ['View'],
				},
			],
		},
	},
	{
		userId: '01JWNNJGS70Y07MBEV3AQ0M526',
		email: 'test@nikki.com',
		displayName: 'đ. Test người dùng',
		permissions: {
			IdentityGroup: [
				{
					scopeType: 'org',
					scopeRef: '01JWNY20G23KD4RV5VWYABQYHD',
					actions: ['*'],
				},
				{
					scopeType: 'org',
					scopeRef: '01K02G6J1CYAN9K8V4PAGSQ5Z8',
					actions: ['*'],
				},
			],
			IdentityUser: [
				{
					scopeType: 'hierarchy',
					scopeRef: '01JWNY20G23KD4RV5VWYABKDT1',
					actions: ['*'],
				},
			],
		},
	},
];
