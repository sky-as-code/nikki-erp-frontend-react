import { KioskSetting } from './types';

// Mock data for kiosk settings
const mockKioskSettingsData: KioskSetting[] = [
	{
		id: '1',
		code: 'SET-001',
		name: 'Thời gian hiển thị quảng cáo',
		description: 'Thời gian mỗi quảng cáo được hiển thị (giây)',
		value: '30',
		category: 'Display',
		status: 'active',
		createdAt: '2024-01-01T08:00:00Z',
		etag: 'etag-set-001',
	},
	{
		id: '2',
		code: 'SET-002',
		name: 'Số lượng sản phẩm hiển thị',
		description: 'Số lượng sản phẩm tối đa hiển thị trên màn hình',
		value: '12',
		category: 'Display',
		status: 'active',
		createdAt: '2024-01-05T09:30:00Z',
		etag: 'etag-set-002',
	},
	{
		id: '3',
		code: 'SET-003',
		name: 'Thời gian chờ thanh toán',
		description: 'Thời gian chờ thanh toán trước khi hủy giao dịch (giây)',
		value: '300',
		category: 'Payment',
		status: 'active',
		createdAt: '2024-01-10T10:15:00Z',
		etag: 'etag-set-003',
	},
	{
		id: '4',
		code: 'SET-004',
		name: 'Phương thức thanh toán mặc định',
		description: 'Phương thức thanh toán được chọn mặc định',
		value: 'cash',
		category: 'Payment',
		status: 'active',
		createdAt: '2024-01-15T14:20:00Z',
		etag: 'etag-set-004',
	},
	{
		id: '5',
		code: 'SET-005',
		name: 'Bật thông báo âm thanh',
		description: 'Bật/tắt thông báo âm thanh khi có giao dịch',
		value: 'true',
		category: 'Notification',
		status: 'active',
		createdAt: '2024-01-20T11:45:00Z',
		etag: 'etag-set-005',
	},
	{
		id: '6',
		code: 'SET-006',
		name: 'Độ sáng màn hình',
		description: 'Độ sáng màn hình kiosk (0-100)',
		value: '80',
		category: 'Display',
		status: 'active',
		createdAt: '2024-02-01T13:30:00Z',
		etag: 'etag-set-006',
	},
	{
		id: '7',
		code: 'SET-007',
		name: 'Thời gian tự động tắt màn hình',
		description: 'Thời gian không hoạt động trước khi tự động tắt màn hình (phút)',
		value: '30',
		category: 'Power',
		status: 'inactive',
		createdAt: '2024-02-05T15:00:00Z',
		etag: 'etag-set-007',
	},
	{
		id: '8',
		code: 'SET-008',
		name: 'Ngôn ngữ hiển thị',
		description: 'Ngôn ngữ mặc định hiển thị trên kiosk',
		value: 'vi',
		category: 'Localization',
		status: 'active',
		createdAt: '2024-02-10T16:20:00Z',
		etag: 'etag-set-008',
	},
	{
		id: '9',
		code: 'SET-009',
		name: 'Múi giờ',
		description: 'Múi giờ sử dụng cho kiosk',
		value: 'Asia/Ho_Chi_Minh',
		category: 'Localization',
		status: 'active',
		createdAt: '2024-02-15T17:30:00Z',
		etag: 'etag-set-009',
	},
	{
		id: '10',
		code: 'SET-010',
		name: 'Kích hoạt chế độ bảo trì',
		description: 'Bật/tắt chế độ bảo trì kiosk',
		value: 'false',
		category: 'Maintenance',
		status: 'active',
		createdAt: '2024-02-20T18:00:00Z',
		etag: 'etag-set-010',
	},
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockKioskSettings = {
	async listKioskSettings(): Promise<KioskSetting[]> {
		await delay(500);
		return [...mockKioskSettingsData];
	},

	async getKioskSetting(id: string): Promise<KioskSetting | undefined> {
		await delay(300);
		return mockKioskSettingsData.find((s) => s.id === id);
	},

	async createKioskSetting(setting: Omit<KioskSetting, 'id' | 'createdAt' | 'etag'>): Promise<KioskSetting> {
		await delay(500);
		const newSetting: KioskSetting = {
			...setting,
			id: String(mockKioskSettingsData.length + 1),
			createdAt: new Date().toISOString(),
			etag: `etag-set-${Date.now()}`,
		};
		mockKioskSettingsData.push(newSetting);
		return newSetting;
	},

	async updateKioskSetting(
		id: string,
		etag: string,
		updates: Partial<Omit<KioskSetting, 'id' | 'createdAt' | 'etag'>>,
	): Promise<KioskSetting> {
		await delay(500);
		const index = mockKioskSettingsData.findIndex((s) => s.id === id);
		if (index === -1) {
			throw new Error('Kiosk setting not found');
		}
		const updatedSetting: KioskSetting = {
			...mockKioskSettingsData[index],
			...updates,
			etag: `etag-set-${Date.now()}`,
		};
		mockKioskSettingsData[index] = updatedSetting;
		return updatedSetting;
	},

	async deleteKioskSetting(id: string): Promise<void> {
		await delay(500);
		const index = mockKioskSettingsData.findIndex((s) => s.id === id);
		if (index === -1) {
			throw new Error('Kiosk setting not found');
		}
		mockKioskSettingsData.splice(index, 1);
	},
};

