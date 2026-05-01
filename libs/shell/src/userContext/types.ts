

export const SLICE_NAME = 'shell.userContext';

export type GetUserContextResponse = {
	id: string;
	avatar_url: string | null;
	display_name: string;
	email: string;
	entitlements: string[];
	orgs: UserContextOrg[];
};

export type UserContextOrg = {
	id: string;
	display_name: string;
	slug: string;
};
