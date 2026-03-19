import { KioskModel } from './types';

/** Mock data cho các dòng máy kiosk (Kiosk Model) */
const mockKioskModelsData: KioskModel[] = [
	{
		id: '1',
		code: 'WATER-MINI',
		name: 'Máy bán nước mini',
		description: 'Dòng máy bán nước mini, kích thước nhỏ gọn, phù hợp cho văn phòng, góc hành lang',
		status: 'active',
		kioskType: 'withoutElevator',
		numberOfTrays: 3,
		trayConfigurations: [
			{ row: 'A', shelfType: 'spring' },
			{ row: 'B', shelfType: 'spring' },
			{ row: 'C', shelfType: 'conveyor' },
		],
		createdAt: '2024-01-01T08:00:00Z',
		etag: 'etag-mdl-001',
	},
	{
		id: '2',
		code: 'LIPSTICK-ELEVATOR',
		name: 'Máy bán son có thang nâng',
		description: 'Dòng máy bán mỹ phẩm (son, phấn) với hệ thống thang nâng, phù hợp sản phẩm nhỏ gọn',
		status: 'active',
		kioskType: 'elevatorWithoutConveyor',
		numberOfTrays: 4,
		trayConfigurations: [
			{ row: 'A', shelfType: 'pushTape' },
			{ row: 'B', shelfType: 'pushTape' },
			{ row: 'C', shelfType: 'hangingConveyor' },
			{ row: 'D', shelfType: 'spring' },
		],
		createdAt: '2024-01-10T09:30:00Z',
		etag: 'etag-mdl-002',
	},
	{
		id: '3',
		code: 'WATER-BASIC',
		name: 'Máy bán nước cơ bản',
		description: 'Dòng máy bán nước cơ bản, không thang nâng, phù hợp chai/lon kích thước chuẩn',
		status: 'active',
		kioskType: 'withoutElevator',
		createdAt: '2024-01-20T10:15:00Z',
		etag: 'etag-mdl-003',
	},
	{
		id: '4',
		code: 'WATER-ELEVATOR',
		name: 'Máy bán nước có thang nâng',
		description: 'Dòng máy bán nước với thang nâng và băng chuyền, vận chuyển hàng tự động',
		status: 'active',
		kioskType: 'elevatorWithConveyor',
		numberOfTrays: 5,
		trayConfigurations: [
			{ row: 'A', shelfType: 'conveyor' },
			{ row: 'B', shelfType: 'conveyor' },
			{ row: 'C', shelfType: 'hangingConveyor' },
			{ row: 'D', shelfType: 'spring' },
			{ row: 'E', shelfType: 'pushTape' },
		],
		createdAt: '2024-02-01T14:20:00Z',
		etag: 'etag-mdl-004',
	},
	{
		id: '5',
		code: 'SNACK-BASIC',
		name: 'Máy bán snack cơ bản',
		description: 'Dòng máy bán snack, bánh kẹo, kích thước trung bình',
		status: 'active',
		kioskType: 'withoutElevator',
		createdAt: '2024-02-10T11:45:00Z',
		etag: 'etag-mdl-005',
	},
	{
		id: '6',
		code: 'COMBO-BASIC',
		name: 'Máy bán nước + snack combo',
		description: 'Dòng máy kết hợp bán nước và snack, phù hợp khu vực công cộng',
		status: 'active',
		kioskType: 'withoutElevator',
		createdAt: '2024-02-20T13:30:00Z',
		etag: 'etag-mdl-006',
	},
	{
		id: '7',
		code: 'COSMETIC-ELEVATOR',
		name: 'Máy bán mỹ phẩm có thang nâng',
		description: 'Dòng máy chuyên mỹ phẩm với thang nâng, nhiều khay hàng',
		status: 'active',
		kioskType: 'elevatorWithConveyor',
		createdAt: '2024-03-01T15:00:00Z',
		etag: 'etag-mdl-007',
	},
	{
		id: '8',
		code: 'WATER-PREMIUM',
		name: 'Máy bán nước cao cấp',
		description: 'Dòng máy bán nước cao cấp, màn hình lớn, quảng cáo tích hợp',
		status: 'inactive',
		kioskType: 'elevatorWithConveyor',
		createdAt: '2024-03-10T16:20:00Z',
		etag: 'etag-mdl-008',
	},
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockKioskModels = {
	async listKioskModels(): Promise<KioskModel[]> {
		await delay(500);
		return [...mockKioskModelsData];
	},

	async getKioskModel(id: string): Promise<KioskModel | undefined> {
		await delay(300);
		return mockKioskModelsData.find((t) => t.id === id);
	},

	async createKioskModel(model: Omit<KioskModel, 'id' | 'createdAt' | 'etag'>): Promise<KioskModel> {
		await delay(500);
		const newModel: KioskModel = {
			...model,
			id: String(mockKioskModelsData.length + 1),
			createdAt: new Date().toISOString(),
			etag: `etag-mdl-${Date.now()}`,
		};
		mockKioskModelsData.push(newModel);
		return newModel;
	},

	async updateKioskModel(
		id: string,
		etag: string,
		updates: Partial<Omit<KioskModel, 'id' | 'createdAt' | 'etag'>>,
	): Promise<KioskModel> {
		await delay(500);
		const index = mockKioskModelsData.findIndex((t) => t.id === id);
		if (index === -1) {
			throw new Error('Kiosk model not found');
		}
		const updatedModel: KioskModel = {
			...mockKioskModelsData[index],
			...updates,
			etag: `etag-mdl-${Date.now()}`,
		};
		mockKioskModelsData[index] = updatedModel;
		return updatedModel;
	},

	async deleteKioskModel(id: string): Promise<void> {
		await delay(500);
		const index = mockKioskModelsData.findIndex((t) => t.id === id);
		if (index === -1) {
			throw new Error('Kiosk model not found');
		}
		mockKioskModelsData.splice(index, 1);
	},
};
