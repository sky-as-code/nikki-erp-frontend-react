import { ConnectionStatus, Kiosk, KioskMode, KioskStatus, UIMode } from '@/features/kiosks/types';


const mockKiosksData: Kiosk[] = [
	{
		id: '1',
		code: 'KIOSK-001',
		name: 'Kiosk Trung Tâm Thành Phố',
		locationAddress: '123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
		latitude: '10.7769',
		longitude: '106.7009',
		status: KioskStatus.ACTIVE,
		isArchived: false,
		mode: KioskMode.SELLING,
		uiMode: UIMode.NORMAL,
		connections: [
			{
				status: ConnectionStatus.FAST,
				createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
			},
		],
		createdAt: '2024-01-15T08:00:00Z',
		etag: 'etag-001',
		modelRef: '01hz',
	},
	{
		id: '2',
		code: 'KIOSK-002',
		name: 'Kiosk Sân Bay Tân Sơn Nhất',
		locationAddress: 'Sân bay Tân Sơn Nhất, Quận Tân Bình, TP.HCM',
		latitude: '10.8188',
		longitude: '106.6520',
		status: KioskStatus.ACTIVE,
		isArchived: false,
		mode: KioskMode.SELLING,
		uiMode: UIMode.NORMAL,
		connections: [
			{
				status: ConnectionStatus.SLOW,
				createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
			},
		],
		createdAt: '2024-01-20T09:30:00Z',
		etag: 'etag-002',
		modelRef: '01hz',
	},
	{
		id: '3',
		code: 'KIOSK-003',
		name: 'Kiosk Bến Thành',
		locationAddress: 'Chợ Bến Thành, Quận 1, TP.HCM',
		latitude: '10.7720',
		longitude: '106.6983',
		status: KioskStatus.INACTIVE,
		isArchived: true,
		mode: KioskMode.PENDING,
		uiMode: UIMode.NORMAL,
		connections: [
			{
				status: ConnectionStatus.DISCONNECTED,
				createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
			},
		],
		createdAt: '2024-02-01T10:15:00Z',
		etag: 'etag-003',
		modelRef: '01hz',
	},
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type PagedResult<T> = { items: T[]; total: number; page: number; size: number };

/** Local mock — not used when `kioskService` calls the real API. */
export const mockKiosks = {
	async listKiosks(page = 0, size = 10): Promise<PagedResult<Kiosk>> {
		await delay(500);
		const start = page * size;
		const items = mockKiosksData.slice(start, start + size);
		return { items, total: mockKiosksData.length, page, size };
	},

	async getKiosk(id: string): Promise<Kiosk | undefined> {
		await delay(300);
		return mockKiosksData.find((k) => k.id === id);
	},
};
