export type User = {
	id: string,
	avatar_url?: string,
	/** Storage path of the uploaded photo; display it with `storageFileUrl`. */
	avatar_file_path?: string | null,
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
