/**
 * A machine principal (`iam_service`). The backend serves it over the same table as `iam_user`, but as a resource
 * of its own: no email, no photo, and it cannot sign in.
 */
export type Service = {
	id: string,
	display_name?: string,
	status?: ServiceStatus,
	etag?: string,
	created_at?: string,
	updated_at?: string,
};

export type ServiceStatus = 'draft' | 'invited' | 'active' | 'suspended';
