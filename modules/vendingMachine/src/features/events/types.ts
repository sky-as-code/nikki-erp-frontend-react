export interface Event {
	id: string;
	code: string;
	name: string;
	description?: string;
	status: 'active' | 'inactive' | 'completed';
	startDate: string;
	endDate: string;
	createdAt: string;
	etag: string;
}

