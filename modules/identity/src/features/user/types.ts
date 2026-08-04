export type User = {
	id: string,
	avatar_url?: string,
	display_name?: string,
	email?: string,
	status?: UserStatus,
	etag?: string,
	created_at?: string,
	updated_at?: string,

	groups?: any[],
	orgUnit?: any,
};

export type UserStatus = 'draft' | 'invited' | 'active' | 'suspended';
