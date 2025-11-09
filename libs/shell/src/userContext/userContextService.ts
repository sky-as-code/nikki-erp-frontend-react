import { delay } from '@nikkierp/common/utils';


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

export class UserContextService {
	public async fetch(): Promise<UserContext> {
		// const response = await request.get<User>('/profile');
		// return response;
		await delay(500);
		return mockContext;
	}
}

export const userContextService = new UserContextService();

const mockModules: Module[] = [
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
		name: 'Authorized',
		slug: 'authorized',
	},
];

const mockOrgs: Organization[] = [
	{
		id: '1',
		name: 'Apple',
		slug: 'apple',
		modules: mockModules,
	},
	{
		id: '2',
		name: 'Banana',
		slug: 'banana',
		modules: mockModules,
	},
	{
		id: '3',
		name: 'Cherry',
		slug: 'cherry',
		modules: mockModules,
	},
	{
		id: '4',
		name: 'Elderberry',
		slug: 'elderberry',
		modules: mockModules,
	},
	{
		id: '5',
		name: 'Fig',
		slug: 'fig',
		modules: mockModules,
	},
	{
		id: '6',
		name: 'Grape',
		slug: 'grape',
		modules: mockModules,
	},
	{
		id: '7',
		name: 'Honeydew',
		slug: 'honeydew',
		modules: mockModules,
	},
	{
		id: '8',
		name: 'Kiwi',
		slug: 'kiwi',
		modules: mockModules,
	},
	{
		id: '9',
		name: 'Lemon',
		slug: 'lemon',
		modules: mockModules,
	},
	{
		id: '10',
		name: 'Mango',
		slug: 'mango',
		modules: mockModules,
	},
];

const mockContext: UserContext = {
	user: {
		id: '1',
		email: 'test@test.com',
		displayName: 'Test User',
	},
	orgs: mockOrgs,
	permissions: [],
};