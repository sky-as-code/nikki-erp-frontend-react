export interface Ad {
	id: string;
	code: string;
	name: string;
	description?: string;
	status: 'active' | 'inactive' | 'expired';
	startDate: string;
	endDate: string;
	createdAt: string;
	etag: string;
}

