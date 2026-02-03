import { KioskDevice } from './types';


const mockKioskDevicesData: KioskDevice[] = [
	{
		id: '1',
		code: 'MOTOR-001',
		name: 'Động cơ đẩy hàng Model A',
		status: 'active',
		deviceType: 'motor',
		description: 'Động cơ đẩy hàng chính xác cao',
		specifications: [
			{ key: 'Công suất', value: '500W' },
			{ key: 'Điện áp', value: '220V' },
			{ key: 'Tốc độ', value: '1000 RPM' },
		],
		createdAt: '2024-01-15T10:00:00Z',
		etag: 'etag-1',
	},
	{
		id: '2',
		code: 'POS-001',
		name: 'Máy POS Thanh toán',
		status: 'active',
		deviceType: 'pos',
		description: 'Máy thanh toán POS hiện đại',
		specifications: [
			{ key: 'Model', value: 'POS-2024' },
			{ key: 'Kết nối', value: 'WiFi, Bluetooth' },
			{ key: 'Màn hình', value: '7 inch Touch' },
		],
		createdAt: '2024-01-16T10:00:00Z',
		etag: 'etag-2',
	},
	{
		id: '3',
		code: 'SCREEN-001',
		name: 'Màn hình Quảng cáo 32 inch',
		status: 'active',
		deviceType: 'screen',
		description: 'Màn hình LED quảng cáo',
		specifications: [
			{ key: 'Kích thước', value: '32 inch' },
			{ key: 'Độ phân giải', value: '1920x1080' },
			{ key: 'Độ sáng', value: '500 nits' },
		],
		createdAt: '2024-01-17T10:00:00Z',
		etag: 'etag-3',
	},
	{
		id: '4',
		code: 'CPU-001',
		name: 'CPU Mini PC',
		status: 'active',
		deviceType: 'cpu',
		description: 'CPU điều khiển hệ thống',
		specifications: [
			{ key: 'Processor', value: 'Intel Core i5' },
			{ key: 'RAM', value: '8GB' },
			{ key: 'Storage', value: '256GB SSD' },
		],
		createdAt: '2024-01-18T10:00:00Z',
		etag: 'etag-4',
	},
	{
		id: '5',
		code: 'ROUTER-001',
		name: 'Router WiFi 6',
		status: 'inactive',
		deviceType: 'router',
		description: 'Router WiFi tốc độ cao',
		specifications: [
			{ key: 'Chuẩn WiFi', value: 'WiFi 6 (802.11ax)' },
			{ key: 'Băng tần', value: '2.4GHz, 5GHz' },
			{ key: 'Tốc độ', value: '3000 Mbps' },
		],
		createdAt: '2024-01-19T10:00:00Z',
		etag: 'etag-5',
	},
];

export const mockKioskDevices = {
	listKioskDevices: async (): Promise<KioskDevice[]> => {
		await new Promise((resolve) => setTimeout(resolve, 500));
		return [...mockKioskDevicesData];
	},

	getKioskDevice: async (id: string): Promise<KioskDevice | undefined> => {
		await new Promise((resolve) => setTimeout(resolve, 300));
		return mockKioskDevicesData.find((d) => d.id === id);
	},

	createKioskDevice: async (kioskDevice: Omit<KioskDevice, 'id' | 'createdAt' | 'etag'>): Promise<KioskDevice> => {
		await new Promise((resolve) => setTimeout(resolve, 500));
		const newKioskDevice: KioskDevice = {
			...kioskDevice,
			id: String(mockKioskDevicesData.length + 1),
			createdAt: new Date().toISOString(),
			etag: `etag-${mockKioskDevicesData.length + 1}`,
		};
		mockKioskDevicesData.push(newKioskDevice);
		return newKioskDevice;
	},

	updateKioskDevice: async (
		id: string,
		etag: string,
		updates: Partial<Omit<KioskDevice, 'id' | 'createdAt' | 'etag'>>,
	): Promise<KioskDevice> => {
		await new Promise((resolve) => setTimeout(resolve, 500));
		const index = mockKioskDevicesData.findIndex((d) => d.id === id);
		if (index === -1) {
			throw new Error('KioskDevice not found');
		}
		const updatedKioskDevice: KioskDevice = {
			...mockKioskDevicesData[index],
			...updates,
			etag: `etag-updated-${Date.now()}`,
		};
		mockKioskDevicesData[index] = updatedKioskDevice;
		return updatedKioskDevice;
	},

	deleteKioskDevice: async (id: string): Promise<void> => {
		await new Promise((resolve) => setTimeout(resolve, 300));
		const index = mockKioskDevicesData.findIndex((d) => d.id === id);
		if (index !== -1) {
			mockKioskDevicesData.splice(index, 1);
		}
	},
};
