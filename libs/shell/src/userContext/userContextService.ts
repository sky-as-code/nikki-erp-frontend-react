import * as request from '@nikkierp/common/request';
import { u } from 'node_modules/react-router/dist/development/index-react-server-client-BIz4AUNd.mjs';


export type User = {
	id: string;
	email: string;
	displayName: string;
};

export type Hierarchy = {
	id: string;
	name: string
	parentId?: string;
	orgId: string;
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
	hierarchies: Hierarchy[];
};

// Temporary hardcode user_id
export const HARDCODED_USER_ID_FOR_CONTEXT = '01JWNXT3EY7FG47VDJTEPTDC98';

type HierarchyApiItem = {
	id: string;
	Name: string;
	ParentId?: string;
	OrgId: string;
	etag?: string;
	createdAt?: string;
};

type OrgApiItem = {
	id: string;
	displayName: string;
	slug: string;
	status?: string;
	address?: string | null;
	legalName?: string | null;
	phoneNumber?: string | null;
	etag?: string;
	createdAt?: string;
};

type UserContextApiUser = {
	id: string;
	displayName: string;
	email: string;
	avatarUrl?: string | null;
	etag?: string;
	createdAt?: string;
	hierarchy?: HierarchyApiItem[];
	orgs?: OrgApiItem[];
};

type UserContextApiResponse = {
	user: UserContextApiUser;
	permissions: PermissionsSnapshot;
};

function mapApiContextToUserContext(data: UserContextApiResponse): UserContext {
	const { user: apiUser, permissions } = data;
	const hierarchies: Hierarchy[] = (apiUser.hierarchy ?? []).map((h) => ({
		id: h.id,
		name: h.Name,
		parentId: h.ParentId,
		orgId: h.OrgId,
	}));
	const orgs: Organization[] = (apiUser.orgs ?? []).map((org) => ({
		id: org.id,
		name: org.displayName,
		slug: org.slug,
		modules: DEFAULT_MODULES,
	}));
	return {
		user: {
			id: apiUser.id,
			email: apiUser.email,
			displayName: apiUser.displayName,
		},
		orgs,
		permissions: permissions ?? {},
		hierarchies,
	};
}

export class UserContextService {
	public async fetch(): Promise<UserContext> {
		try {
			const data = await request.get<UserContextApiResponse>(
				`identity/users/context`,
			);
			const context = mapApiContextToUserContext(data);
			console.log('Fetched user context:', context);
			return context;
		}
		catch (error) {
			console.error('Error fetching user context:', error);
			throw error;
		}
	}
}

export const userContextService = new UserContextService();


export const DEFAULT_MODULES: Module[] = [
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