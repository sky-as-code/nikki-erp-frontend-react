import { Event } from './types';

// Mock data for events
const mockEventsData: Event[] = [
	{
		id: '1',
		code: 'EVT-001',
		name: 'Sự kiện Giảm giá Black Friday',
		description: 'Sự kiện giảm giá lớn nhất năm, áp dụng cho tất cả sản phẩm',
		status: 'active',
		startDate: '2024-11-24T00:00:00Z',
		endDate: '2024-11-30T23:59:59Z',
		createdAt: '2024-10-01T08:00:00Z',
		etag: 'etag-evt-001',
	},
	{
		id: '2',
		code: 'EVT-002',
		name: 'Sự kiện Tết Nguyên Đán',
		description: 'Chương trình khuyến mãi đặc biệt dịp Tết',
		status: 'completed',
		startDate: '2024-01-20T00:00:00Z',
		endDate: '2024-02-05T23:59:59Z',
		createdAt: '2023-12-15T09:30:00Z',
		etag: 'etag-evt-002',
	},
	{
		id: '3',
		code: 'EVT-003',
		name: 'Sự kiện Mùa hè',
		description: 'Giảm giá các sản phẩm mùa hè',
		status: 'active',
		startDate: '2024-06-01T00:00:00Z',
		endDate: '2024-08-31T23:59:59Z',
		createdAt: '2024-05-15T10:15:00Z',
		etag: 'etag-evt-003',
	},
	{
		id: '4',
		code: 'EVT-004',
		name: 'Sự kiện Back to School',
		description: 'Khuyến mãi đồ dùng học tập',
		status: 'inactive',
		startDate: '2024-08-15T00:00:00Z',
		endDate: '2024-09-15T23:59:59Z',
		createdAt: '2024-07-20T14:20:00Z',
		etag: 'etag-evt-004',
	},
	{
		id: '5',
		code: 'EVT-005',
		name: 'Sự kiện Trung thu',
		description: 'Chương trình đặc biệt dịp Trung thu',
		status: 'active',
		startDate: '2024-09-10T00:00:00Z',
		endDate: '2024-09-20T23:59:59Z',
		createdAt: '2024-08-25T11:45:00Z',
		etag: 'etag-evt-005',
	},
	{
		id: '6',
		code: 'EVT-006',
		name: 'Sự kiện Giáng sinh',
		description: 'Khuyến mãi Giáng sinh và Năm mới',
		status: 'inactive',
		startDate: '2024-12-20T00:00:00Z',
		endDate: '2025-01-05T23:59:59Z',
		createdAt: '2024-11-30T13:30:00Z',
		etag: 'etag-evt-006',
	},
	{
		id: '7',
		code: 'EVT-007',
		name: 'Sự kiện Valentine',
		description: 'Chương trình đặc biệt ngày Valentine',
		status: 'completed',
		startDate: '2024-02-10T00:00:00Z',
		endDate: '2024-02-17T23:59:59Z',
		createdAt: '2024-01-25T15:00:00Z',
		etag: 'etag-evt-007',
	},
	{
		id: '8',
		code: 'EVT-008',
		name: 'Sự kiện Quốc khánh',
		description: 'Khuyến mãi dịp Quốc khánh 2/9',
		status: 'active',
		startDate: '2024-09-01T00:00:00Z',
		endDate: '2024-09-05T23:59:59Z',
		createdAt: '2024-08-15T16:20:00Z',
		etag: 'etag-evt-008',
	},
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockEvents = {
	async listEvents(): Promise<Event[]> {
		await delay(500);
		return [...mockEventsData];
	},

	async getEvent(id: string): Promise<Event | undefined> {
		await delay(300);
		return mockEventsData.find((e) => e.id === id);
	},

	async createEvent(event: Omit<Event, 'id' | 'createdAt' | 'etag'>): Promise<Event> {
		await delay(500);
		const newEvent: Event = {
			...event,
			id: String(mockEventsData.length + 1),
			createdAt: new Date().toISOString(),
			etag: `etag-evt-${Date.now()}`,
		};
		mockEventsData.push(newEvent);
		return newEvent;
	},

	async updateEvent(
		id: string,
		etag: string,
		updates: Partial<Omit<Event, 'id' | 'createdAt' | 'etag'>>,
	): Promise<Event> {
		await delay(500);
		const index = mockEventsData.findIndex((e) => e.id === id);
		if (index === -1) {
			throw new Error('Event not found');
		}
		const updatedEvent: Event = {
			...mockEventsData[index],
			...updates,
			etag: `etag-evt-${Date.now()}`,
		};
		mockEventsData[index] = updatedEvent;
		return updatedEvent;
	},

	async deleteEvent(id: string): Promise<void> {
		await delay(500);
		const index = mockEventsData.findIndex((e) => e.id === id);
		if (index === -1) {
			throw new Error('Event not found');
		}
		mockEventsData.splice(index, 1);
	},
};

