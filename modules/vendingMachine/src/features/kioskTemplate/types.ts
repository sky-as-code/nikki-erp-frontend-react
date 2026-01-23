export interface KioskTemplate {
	id: string;
	code: string;
	name: string;
	description?: string;
	status: 'active' | 'inactive';
	createdAt: string;
	etag: string;
}

