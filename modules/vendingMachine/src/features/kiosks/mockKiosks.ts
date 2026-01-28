import { ConnectionStatus, Kiosk, KioskMode, KioskStatus, MachineType } from './types';

// Mock data for kiosks
const mockKiosksData: Kiosk[] = [
	{
		id: '1',
		code: 'KIOSK-001',
		name: 'Kiosk Trung Tâm Thành Phố',
		address: '123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
		coordinates: {
			latitude: 10.7769,
			longitude: 106.7009,
		},
		isActive: true,
		status: KioskStatus.ACTIVATED,
		mode: KioskMode.SELLING,
		machineType: MachineType.DROP_PRODUCT,
		connectionStatus: ConnectionStatus.FAST,
		connectionHistory: [
			{ status: ConnectionStatus.FAST, reportedAt: new Date(Date.now() - 5 * 60000).toISOString() },
			{ status: ConnectionStatus.FAST, reportedAt: new Date(Date.now() - 15 * 60000).toISOString() },
			{ status: ConnectionStatus.SLOW, reportedAt: new Date(Date.now() - 30 * 60000).toISOString() },
		],
		temperature: 24.5,
		humidity: 55.2,
		powerConsumption: 285.3,
		createdAt: '2024-01-15T08:00:00Z',
		etag: 'etag-001',
	},
	{
		id: '2',
		code: 'KIOSK-002',
		name: 'Kiosk Sân Bay Tân Sơn Nhất',
		address: 'Sân bay Tân Sơn Nhất, Quận Tân Bình, TP.HCM',
		coordinates: {
			latitude: 10.8188,
			longitude: 106.6520,
		},
		isActive: true,
		status: KioskStatus.ACTIVATED,
		mode: KioskMode.SELLING,
		machineType: MachineType.ELEVATOR,
		connectionStatus: ConnectionStatus.SLOW,
		connectionHistory: [
			{ status: ConnectionStatus.SLOW, reportedAt: new Date(Date.now() - 10 * 60000).toISOString() },
			{ status: ConnectionStatus.FAST, reportedAt: new Date(Date.now() - 25 * 60000).toISOString() },
			{ status: ConnectionStatus.SLOW, reportedAt: new Date(Date.now() - 45 * 60000).toISOString() },
		],
		temperature: 22.8,
		humidity: 48.5,
		powerConsumption: 312.7,
		createdAt: '2024-01-20T09:30:00Z',
		etag: 'etag-002',
	},
	{
		id: '3',
		code: 'KIOSK-003',
		name: 'Kiosk Bến Thành',
		address: 'Chợ Bến Thành, Quận 1, TP.HCM',
		coordinates: {
			latitude: 10.7720,
			longitude: 106.6983,
		},
		isActive: false,
		status: KioskStatus.DISABLED,
		mode: KioskMode.PENDING,
		machineType: MachineType.DROP_PRODUCT,
		connectionStatus: ConnectionStatus.DISCONNECTED,
		connectionHistory: [
			{ status: ConnectionStatus.DISCONNECTED, reportedAt: new Date(Date.now() - 2 * 3600000).toISOString() },
			{ status: ConnectionStatus.SLOW, reportedAt: new Date(Date.now() - 3 * 3600000).toISOString() },
			{ status: ConnectionStatus.FAST, reportedAt: new Date(Date.now() - 4 * 3600000).toISOString() },
		],
		temperature: 28.3,
		humidity: 68.9,
		powerConsumption: 0,
		createdAt: '2024-02-01T10:15:00Z',
		etag: 'etag-003',
	},
	{
		id: '4',
		code: 'KIOSK-004',
		name: 'Kiosk Vincom Center',
		address: '72 Lê Thánh Tôn, Quận 1, TP.HCM',
		coordinates: {
			latitude: 10.7756,
			longitude: 106.7019,
		},
		isActive: true,
		status: KioskStatus.ACTIVATED,
		mode: KioskMode.ADSONLY,
		machineType: MachineType.DROP_PRODUCT,
		connectionStatus: ConnectionStatus.FAST,
		connectionHistory: [
			{ status: ConnectionStatus.FAST, reportedAt: new Date(Date.now() - 3 * 60000).toISOString() },
			{ status: ConnectionStatus.FAST, reportedAt: new Date(Date.now() - 20 * 60000).toISOString() },
		],
		temperature: 23.2,
		humidity: 52.1,
		powerConsumption: 198.5,
		createdAt: '2024-02-10T14:20:00Z',
		etag: 'etag-004',
	},
	{
		id: '5',
		code: 'KIOSK-005',
		name: 'Kiosk Landmark 81',
		address: '208 Nguyễn Hữu Cảnh, Quận Bình Thạnh, TP.HCM',
		coordinates: {
			latitude: 10.7947,
			longitude: 106.7219,
		},
		isActive: true,
		status: KioskStatus.ACTIVATED,
		mode: KioskMode.SELLING,
		machineType: MachineType.DROP_PRODUCT,
		connectionStatus: ConnectionStatus.FAST,
		connectionHistory: [
			{ status: ConnectionStatus.FAST, reportedAt: new Date(Date.now() - 1 * 60000).toISOString() },
		],
		temperature: 25.1,
		humidity: 58.7,
		powerConsumption: 298.9,
		createdAt: '2024-02-15T11:45:00Z',
		etag: 'etag-005',
	},
	{
		id: '6',
		code: 'KIOSK-006',
		name: 'Kiosk Đã Xóa',
		address: '456 Đường Lê Lợi, Quận 1, TP.HCM',
		coordinates: {
			latitude: 10.7719,
			longitude: 106.6978,
		},
		isActive: false,
		status: KioskStatus.DELETED,
		mode: KioskMode.PENDING,
		machineType: MachineType.ELEVATOR,
		connectionStatus: ConnectionStatus.DISCONNECTED,
		connectionHistory: [],
		powerConsumption: 0,
		createdAt: '2024-01-05T07:00:00Z',
		deletedAt: '2024-03-01T12:00:00Z',
		etag: 'etag-006',
	},
	{
		id: '7',
		code: 'KIOSK-007',
		name: 'Kiosk Crescent Mall',
		address: '101 Tôn Dật Tiên, Quận 7, TP.HCM',
		coordinates: {
			latitude: 10.7296,
			longitude: 106.7158,
		},
		isActive: true,
		status: KioskStatus.ACTIVATED,
		mode: KioskMode.SELLING,
		machineType: MachineType.ELEVATOR,
		connectionStatus: ConnectionStatus.SLOW,
		connectionHistory: [
			{ status: ConnectionStatus.SLOW, reportedAt: new Date(Date.now() - 8 * 60000).toISOString() },
			{ status: ConnectionStatus.FAST, reportedAt: new Date(Date.now() - 35 * 60000).toISOString() },
		],
		temperature: 26.4,
		humidity: 61.3,
		powerConsumption: 275.2,
		createdAt: '2024-02-20T13:30:00Z',
		etag: 'etag-007',
	},
	{
		id: '8',
		code: 'KIOSK-008',
		name: 'Kiosk Bitexco',
		address: '2 Hải Triều, Quận 1, TP.HCM',
		coordinates: {
			latitude: 10.7718,
			longitude: 106.7042,
		},
		isActive: false,
		status: KioskStatus.DISABLED,
		mode: KioskMode.ADSONLY,
		machineType: MachineType.DROP_PRODUCT,
		connectionStatus: ConnectionStatus.DISCONNECTED,
		connectionHistory: [
			{ status: ConnectionStatus.DISCONNECTED, reportedAt: new Date(Date.now() - 1 * 3600000).toISOString() },
		],
		temperature: 27.6,
		humidity: 65.4,
		powerConsumption: 0,
		createdAt: '2024-02-25T15:00:00Z',
		etag: 'etag-008',
	},
	{
		id: '9',
		code: 'KIOSK-009',
		name: 'Kiosk Bãi biển Mỹ Khê',
		address: 'Bãi biển Mỹ Khê, Quận Sơn Trà, Đà Nẵng',
		coordinates: {
			latitude: 16.0544,
			longitude: 108.2022,
		},
		isActive: true,
		status: KioskStatus.ACTIVATED,
		mode: KioskMode.SELLING,
		machineType: MachineType.DROP_PRODUCT,
		connectionStatus: ConnectionStatus.FAST,
		connectionHistory: [
			{ status: ConnectionStatus.FAST, reportedAt: new Date(Date.now() - 1 * 60000).toISOString() },
			{ status: ConnectionStatus.FAST, reportedAt: new Date(Date.now() - 22 * 60000).toISOString() },
		],
		temperature: 28.5,
		humidity: 75.2,
		powerConsumption: 245.8,
		createdAt: '2024-03-05T10:30:00Z',
		etag: 'etag-010',
	},
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockKiosks = {
	async listKiosks(): Promise<Kiosk[]> {
		await delay(500);
		return [...mockKiosksData];
	},

	async getKiosk(id: string): Promise<Kiosk | undefined> {
		await delay(300);
		return mockKiosksData.find((k) => k.id === id);
	},

	async createKiosk(kiosk: Omit<Kiosk, 'id' | 'createdAt' | 'etag'>): Promise<Kiosk> {
		await delay(500);
		const newKiosk: Kiosk = {
			...kiosk,
			id: String(mockKiosksData.length + 1),
			createdAt: new Date().toISOString(),
			etag: `etag-${Date.now()}`,
		};
		mockKiosksData.push(newKiosk);
		return newKiosk;
	},

	async updateKiosk(
		id: string,
		etag: string,
		updates: Partial<Omit<Kiosk, 'id' | 'createdAt' | 'etag'>>,
	): Promise<Kiosk> {
		await delay(500);
		const index = mockKiosksData.findIndex((k) => k.id === id);
		if (index === -1) {
			throw new Error('Kiosk not found');
		}
		const updatedKiosk: Kiosk = {
			...mockKiosksData[index],
			...updates,
			etag: `etag-${Date.now()}`,
		};
		mockKiosksData[index] = updatedKiosk;
		return updatedKiosk;
	},

	async deleteKiosk(id: string): Promise<void> {
		await delay(500);
		const index = mockKiosksData.findIndex((k) => k.id === id);
		if (index === -1) {
			throw new Error('Kiosk not found');
		}
		mockKiosksData[index] = {
			...mockKiosksData[index],
			status: KioskStatus.DELETED,
			isActive: false,
			deletedAt: new Date().toISOString(),
		};
	},
};

