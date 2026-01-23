import { Ad } from './types';

// Mock data for ads
const mockAdsData: Ad[] = [
	{
		id: '1',
		code: 'AD-001',
		name: 'Quảng cáo Coca Cola',
		description: 'Quảng cáo nước giải khát Coca Cola tại các kiosk',
		status: 'active',
		startDate: '2024-01-01T00:00:00Z',
		endDate: '2024-12-31T23:59:59Z',
		createdAt: '2024-01-01T08:00:00Z',
		etag: 'etag-ad-001',
	},
	{
		id: '2',
		code: 'AD-002',
		name: 'Quảng cáo Samsung',
		description: 'Quảng cáo điện thoại Samsung Galaxy',
		status: 'active',
		startDate: '2024-02-01T00:00:00Z',
		endDate: '2024-11-30T23:59:59Z',
		createdAt: '2024-02-01T09:30:00Z',
		etag: 'etag-ad-002',
	},
	{
		id: '3',
		code: 'AD-003',
		name: 'Quảng cáo Nike',
		description: 'Quảng cáo giày thể thao Nike',
		status: 'inactive',
		startDate: '2024-03-01T00:00:00Z',
		endDate: '2024-10-31T23:59:59Z',
		createdAt: '2024-03-01T10:15:00Z',
		etag: 'etag-ad-003',
	},
	{
		id: '4',
		code: 'AD-004',
		name: 'Quảng cáo McDonald\'s',
		description: 'Quảng cáo thức ăn nhanh McDonald\'s',
		status: 'active',
		startDate: '2024-04-01T00:00:00Z',
		endDate: '2024-09-30T23:59:59Z',
		createdAt: '2024-04-01T14:20:00Z',
		etag: 'etag-ad-004',
	},
	{
		id: '5',
		code: 'AD-005',
		name: 'Quảng cáo Apple',
		description: 'Quảng cáo iPhone và iPad',
		status: 'expired',
		startDate: '2023-12-01T00:00:00Z',
		endDate: '2024-03-31T23:59:59Z',
		createdAt: '2023-12-01T11:45:00Z',
		etag: 'etag-ad-005',
	},
	{
		id: '6',
		code: 'AD-006',
		name: 'Quảng cáo VinFast',
		description: 'Quảng cáo xe điện VinFast',
		status: 'active',
		startDate: '2024-05-01T00:00:00Z',
		endDate: '2024-08-31T23:59:59Z',
		createdAt: '2024-05-01T13:30:00Z',
		etag: 'etag-ad-006',
	},
	{
		id: '7',
		code: 'AD-007',
		name: 'Quảng cáo Shopee',
		description: 'Quảng cáo sàn thương mại điện tử Shopee',
		status: 'inactive',
		startDate: '2024-06-01T00:00:00Z',
		endDate: '2024-07-31T23:59:59Z',
		createdAt: '2024-06-01T15:00:00Z',
		etag: 'etag-ad-007',
	},
	{
		id: '8',
		code: 'AD-008',
		name: 'Quảng cáo The Coffee House',
		description: 'Quảng cáo cà phê The Coffee House',
		status: 'active',
		startDate: '2024-07-01T00:00:00Z',
		endDate: '2024-12-31T23:59:59Z',
		createdAt: '2024-07-01T16:20:00Z',
		etag: 'etag-ad-008',
	},
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockAds = {
	async listAds(): Promise<Ad[]> {
		await delay(500);
		return [...mockAdsData];
	},

	async getAd(id: string): Promise<Ad | undefined> {
		await delay(300);
		return mockAdsData.find((a) => a.id === id);
	},

	async createAd(ad: Omit<Ad, 'id' | 'createdAt' | 'etag'>): Promise<Ad> {
		await delay(500);
		const newAd: Ad = {
			...ad,
			id: String(mockAdsData.length + 1),
			createdAt: new Date().toISOString(),
			etag: `etag-ad-${Date.now()}`,
		};
		mockAdsData.push(newAd);
		return newAd;
	},

	async updateAd(
		id: string,
		etag: string,
		updates: Partial<Omit<Ad, 'id' | 'createdAt' | 'etag'>>,
	): Promise<Ad> {
		await delay(500);
		const index = mockAdsData.findIndex((a) => a.id === id);
		if (index === -1) {
			throw new Error('Ad not found');
		}
		const updatedAd: Ad = {
			...mockAdsData[index],
			...updates,
			etag: `etag-ad-${Date.now()}`,
		};
		mockAdsData[index] = updatedAd;
		return updatedAd;
	},

	async deleteAd(id: string): Promise<void> {
		await delay(500);
		const index = mockAdsData.findIndex((a) => a.id === id);
		if (index === -1) {
			throw new Error('Ad not found');
		}
		mockAdsData.splice(index, 1);
	},
};

