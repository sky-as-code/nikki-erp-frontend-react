import { mockKiosks } from '@/features/kiosks/mocks';

import { KioskSetting } from './types';
import { mockGames } from '../games/mockGames';
import { mockSlideshows } from '../slideshow/mockSlideshows';
import { mockThemes } from '../themes/mockThemes';

/** Mock data cho các nhóm cài đặt hoạt động kiosk (kiosk, trình chiếu, chủ đề, trò chơi, brand...) */
const mockKioskSettingsData: Omit<KioskSetting, 'kiosks' | 'theme' | 'game' | 'idlePlaylist' | 'shoppingPlaylist'>[] = [
	{
		id: '1',
		code: 'CFG-SELLING',
		name: 'Cài đặt bán hàng cơ bản',
		description: 'Trình chiếu quảng cáo khi chờ, chủ đề mặc định, không trò chơi',
		status: 'active',
		createdAt: '2024-01-01T08:00:00Z',
		etag: 'etag-cfg-001',
	},
	{
		id: '2',
		code: 'CFG-ADS-ONLY',
		name: 'Cài đặt chỉ quảng cáo',
		description: 'Chỉ trình chiếu quảng cáo, không bán hàng',
		status: 'active',
		createdAt: '2024-01-10T09:30:00Z',
		etag: 'etag-cfg-002',
	},
	{
		id: '3',
		code: 'CFG-COCA-COLA',
		name: 'Cài đặt thương hiệu Coca-Cola',
		description: 'Chủ đề đỏ trắng, trình chiếu Coca-Cola, brand Coca-Cola',
		status: 'active',
		brand: 'Coca-Cola',
		createdAt: '2024-01-20T10:15:00Z',
		etag: 'etag-cfg-003',
	},
	{
		id: '4',
		code: 'CFG-ENTERTAINMENT',
		name: 'Cài đặt giải trí',
		description: 'Chủ đề sinh động, trò chơi mini, trình chiếu đa dạng',
		status: 'active',
		createdAt: '2024-02-01T14:20:00Z',
		etag: 'etag-cfg-004',
	},
	{
		id: '5',
		code: 'CFG-PEPSI',
		name: 'Cài đặt thương hiệu Pepsi',
		description: 'Chủ đề xanh dương, brand Pepsi',
		status: 'active',
		brand: 'Pepsi',
		createdAt: '2024-02-10T11:45:00Z',
		etag: 'etag-cfg-005',
	},
	{
		id: '6',
		code: 'CFG-MINIMAL',
		name: 'Cài đặt tối giản',
		description: 'Giao diện đơn giản, ít trình chiếu, không trò chơi',
		status: 'inactive',
		createdAt: '2024-02-20T13:30:00Z',
		etag: 'etag-cfg-006',
	},
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockKioskSettings = {
	async listKioskSettings(): Promise<KioskSetting[]> {
		await delay(500);
		return mockKioskSettingsData.map((s) => ({ ...s, kiosks: [] }));
	},

	async getKioskSetting(id: string): Promise<KioskSetting | undefined> {
		await delay(300);
		const base = mockKioskSettingsData.find((s) => s.id === id);
		if (!base) return undefined;

		const [kiosks, themes, games, slideshows] = await Promise.all([
			mockKiosks.listKiosks(),
			mockThemes.listThemes(),
			mockGames.listGames(),
			mockSlideshows.listSlideshows(),
		]);

		// Enrich with mock data based on setting id
		const enriched: KioskSetting = {
			...base,
			kiosks: id === '1' ? [kiosks[0], kiosks[1]] : id === '3' ? [kiosks[0], kiosks[2], kiosks[3]] : [],
			theme: id === '1' ? themes[0] : id === '3' ? themes[2] : id === '4' ? themes[3] : undefined,
			themeId: id === '1' ? themes[0]?.id : id === '3' ? themes[2]?.id : id === '4' ? themes[3]?.id : undefined,
			game: id === '4' ? games[0] : id === '3' ? games[1] : undefined,
			gameId: id === '4' ? games[0]?.id : id === '3' ? games[1]?.id : undefined,
			idlePlaylist: id === '1' ? slideshows[0] : id === '2' ? slideshows[1] : undefined,
			shoppingPlaylist: id === '1' ? slideshows[1] : id === '3' ? slideshows[0] : undefined,
		};
		return enriched;
	},

	async createKioskSetting(setting: Omit<KioskSetting, 'id' | 'createdAt' | 'etag'>): Promise<KioskSetting> {
		await delay(500);
		const newSetting: KioskSetting = {
			...setting,
			id: String(mockKioskSettingsData.length + 1),
			createdAt: new Date().toISOString(),
			etag: `etag-cfg-${Date.now()}`,
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
			etag: `etag-cfg-${Date.now()}`,
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
