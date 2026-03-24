import { Slideshow } from './types';

const mockSlideshowsData: Slideshow[] = [
	{
		id: '1',
		code: 'SS-001',
		name: 'Trình chiếu Coca Cola',
		description: 'Trình chiếu nước giải khát Coca Cola tại các kiosk',
		status: 'active',
		startDate: '2024-01-01T00:00:00Z',
		endDate: '2024-12-31T23:59:59Z',
		media: [
			{
				id: 'media-1',
				code: 'MED-001',
				name: 'Coca Cola Slideshow',
				duration: 30,
				type: 'video',
				url: 'https://via.placeholder.com/1920x1080',
				thumbnailUrl: 'https://via.placeholder.com/300x200',
				order: 1,
			},
			{
				id: 'media-2',
				code: 'MED-002',
				name: 'Pepsi Banner',
				type: 'image',
				url: 'https://via.placeholder.com/1920x1080',
				order: 2,
			},
		],
		createdAt: '2024-01-01T08:00:00Z',
		etag: 'etag-ss-001',
	},
	{
		id: '2', code: 'SS-002', name: 'Trình chiếu Samsung', description: 'Trình chiếu điện thoại Samsung Galaxy',
		status: 'active', startDate: '2024-02-01T00:00:00Z', endDate: '2024-11-30T23:59:59Z',
		media: [{ id: 'media-6', code: 'MED-006', name: 'Samsung Galaxy Slideshow', duration: 60, type: 'video', url: 'https://via.placeholder.com/1920x1080', thumbnailUrl: 'https://via.placeholder.com/300x200', order: 1 }],
		createdAt: '2024-02-01T09:30:00Z', etag: 'etag-ss-002',
	},
	{
		id: '3', code: 'SS-003', name: 'Trình chiếu Nike', description: 'Trình chiếu giày thể thao Nike',
		status: 'inactive', startDate: '2024-03-01T00:00:00Z', endDate: '2024-10-31T23:59:59Z',
		media: [], createdAt: '2024-03-01T10:15:00Z', etag: 'etag-ss-003',
	},
	{
		id: '4', code: 'SS-004', name: 'Trình chiếu McDonald\'s', description: 'Trình chiếu thức ăn nhanh McDonald\'s',
		status: 'active', startDate: '2024-04-01T00:00:00Z', endDate: '2024-09-30T23:59:59Z',
		media: [], createdAt: '2024-04-01T14:20:00Z', etag: 'etag-ss-004',
	},
	{
		id: '5', code: 'SS-005', name: 'Trình chiếu Apple', description: 'Trình chiếu iPhone và iPad',
		status: 'expired', startDate: '2023-12-01T00:00:00Z', endDate: '2024-03-31T23:59:59Z',
		media: [], createdAt: '2023-12-01T11:45:00Z', etag: 'etag-ss-005',
	},
	{
		id: '6', code: 'SS-006', name: 'Trình chiếu VinFast', description: 'Trình chiếu xe điện VinFast',
		status: 'active', startDate: '2024-05-01T00:00:00Z', endDate: '2024-08-31T23:59:59Z',
		media: [], createdAt: '2024-05-01T13:30:00Z', etag: 'etag-ss-006',
	},
	{
		id: '7', code: 'SS-007', name: 'Trình chiếu Shopee', description: 'Trình chiếu sàn thương mại điện tử Shopee',
		status: 'inactive', startDate: '2024-06-01T00:00:00Z', endDate: '2024-07-31T23:59:59Z',
		media: [], createdAt: '2024-06-01T15:00:00Z', etag: 'etag-ss-007',
	},
	{
		id: '8', code: 'SS-008', name: 'Trình chiếu The Coffee House', description: 'Trình chiếu cà phê The Coffee House',
		status: 'active', startDate: '2024-07-01T00:00:00Z', endDate: '2024-12-31T23:59:59Z',
		media: [], createdAt: '2024-07-01T16:20:00Z', etag: 'etag-ss-008',
	},
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockSlideshows = {
	async listSlideshows(): Promise<Slideshow[]> {
		await delay(500);
		return [...mockSlideshowsData];
	},
	async getSlideshow(id: string): Promise<Slideshow | undefined> {
		await delay(300);
		return mockSlideshowsData.find((s) => s.id === id);
	},
	async createSlideshow(slideshow: Omit<Slideshow, 'id' | 'createdAt' | 'etag'>): Promise<Slideshow> {
		await delay(500);
		const newSlideshow: Slideshow = {
			...slideshow, media: slideshow.media || [],
			id: String(mockSlideshowsData.length + 1),
			createdAt: new Date().toISOString(),
			etag: `etag-ss-${Date.now()}`,
		};
		mockSlideshowsData.push(newSlideshow);
		return newSlideshow;
	},
	async updateSlideshow(id: string, etag: string, updates: Partial<Omit<Slideshow, 'id' | 'createdAt' | 'etag'>>): Promise<Slideshow> {
		await delay(500);
		const index = mockSlideshowsData.findIndex((s) => s.id === id);
		if (index === -1) throw new Error('Slideshow not found');
		const updated: Slideshow = { ...mockSlideshowsData[index], ...updates, etag: `etag-ss-${Date.now()}` };
		mockSlideshowsData[index] = updated;
		return updated;
	},
	async deleteSlideshow(id: string): Promise<void> {
		await delay(500);
		const index = mockSlideshowsData.findIndex((s) => s.id === id);
		if (index === -1) throw new Error('Slideshow not found');
		mockSlideshowsData.splice(index, 1);
	},
};
