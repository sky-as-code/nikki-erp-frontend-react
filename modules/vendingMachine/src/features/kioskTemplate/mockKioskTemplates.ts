import { KioskTemplate } from './types';

// Mock data for kiosk templates
const mockKioskTemplatesData: KioskTemplate[] = [
	{
		id: '1',
		code: 'TMP-001',
		name: 'Template Cơ bản',
		description: 'Template cơ bản cho kiosk với layout đơn giản',
		status: 'active',
		createdAt: '2024-01-01T08:00:00Z',
		etag: 'etag-tmp-001',
	},
	{
		id: '2',
		code: 'TMP-002',
		name: 'Template Thương mại',
		description: 'Template phù hợp cho kiosk thương mại, tập trung vào sản phẩm',
		status: 'active',
		createdAt: '2024-01-10T09:30:00Z',
		etag: 'etag-tmp-002',
	},
	{
		id: '3',
		code: 'TMP-003',
		name: 'Template Quảng cáo',
		description: 'Template tối ưu cho hiển thị quảng cáo và nội dung marketing',
		status: 'active',
		createdAt: '2024-01-20T10:15:00Z',
		etag: 'etag-tmp-003',
	},
	{
		id: '4',
		code: 'TMP-004',
		name: 'Template Giải trí',
		description: 'Template với giao diện sinh động, phù hợp cho kiosk giải trí',
		status: 'inactive',
		createdAt: '2024-02-01T14:20:00Z',
		etag: 'etag-tmp-004',
	},
	{
		id: '5',
		code: 'TMP-005',
		name: 'Template Tối giản',
		description: 'Template tối giản với giao diện sạch sẽ, dễ sử dụng',
		status: 'active',
		createdAt: '2024-02-10T11:45:00Z',
		etag: 'etag-tmp-005',
	},
	{
		id: '6',
		code: 'TMP-006',
		name: 'Template Cao cấp',
		description: 'Template cao cấp với nhiều tính năng và hiệu ứng',
		status: 'active',
		createdAt: '2024-02-20T13:30:00Z',
		etag: 'etag-tmp-006',
	},
	{
		id: '7',
		code: 'TMP-007',
		name: 'Template Nhanh',
		description: 'Template tối ưu cho giao dịch nhanh, ít bước',
		status: 'active',
		createdAt: '2024-03-01T15:00:00Z',
		etag: 'etag-tmp-007',
	},
	{
		id: '8',
		code: 'TMP-008',
		name: 'Template Đa ngôn ngữ',
		description: 'Template hỗ trợ nhiều ngôn ngữ, phù hợp khu vực quốc tế',
		status: 'inactive',
		createdAt: '2024-03-10T16:20:00Z',
		etag: 'etag-tmp-008',
	},
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockKioskTemplates = {
	async listKioskTemplates(): Promise<KioskTemplate[]> {
		await delay(500);
		return [...mockKioskTemplatesData];
	},

	async getKioskTemplate(id: string): Promise<KioskTemplate | undefined> {
		await delay(300);
		return mockKioskTemplatesData.find((t) => t.id === id);
	},

	async createKioskTemplate(template: Omit<KioskTemplate, 'id' | 'createdAt' | 'etag'>): Promise<KioskTemplate> {
		await delay(500);
		const newTemplate: KioskTemplate = {
			...template,
			id: String(mockKioskTemplatesData.length + 1),
			createdAt: new Date().toISOString(),
			etag: `etag-tmp-${Date.now()}`,
		};
		mockKioskTemplatesData.push(newTemplate);
		return newTemplate;
	},

	async updateKioskTemplate(
		id: string,
		etag: string,
		updates: Partial<Omit<KioskTemplate, 'id' | 'createdAt' | 'etag'>>,
	): Promise<KioskTemplate> {
		await delay(500);
		const index = mockKioskTemplatesData.findIndex((t) => t.id === id);
		if (index === -1) {
			throw new Error('Kiosk template not found');
		}
		const updatedTemplate: KioskTemplate = {
			...mockKioskTemplatesData[index],
			...updates,
			etag: `etag-tmp-${Date.now()}`,
		};
		mockKioskTemplatesData[index] = updatedTemplate;
		return updatedTemplate;
	},

	async deleteKioskTemplate(id: string): Promise<void> {
		await delay(500);
		const index = mockKioskTemplatesData.findIndex((t) => t.id === id);
		if (index === -1) {
			throw new Error('Kiosk template not found');
		}
		mockKioskTemplatesData.splice(index, 1);
	},
};

