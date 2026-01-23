export interface KioskSetting {
	id: string;
	code: string;
	name: string;
	description?: string;
	value: string;
	category: string;
	status: 'active' | 'inactive';
	createdAt: string;
	etag: string;
}

