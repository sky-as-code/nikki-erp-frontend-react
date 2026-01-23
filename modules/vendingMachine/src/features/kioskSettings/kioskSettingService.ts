import { mockKioskSettings } from './mockKioskSettings';
import { KioskSetting } from './types';


function configFields(dto: KioskSetting): KioskSetting {
	return {
		...dto,
	};
}

export const kioskSettingService = {
	async listKioskSettings(): Promise<KioskSetting[]> {
		const result = await mockKioskSettings.listKioskSettings();
		return result.map(configFields);
	},

	async getKioskSetting(id: string): Promise<KioskSetting | undefined> {
		const result = await mockKioskSettings.getKioskSetting(id);
		return result ? configFields(result) : undefined;
	},

	async createKioskSetting(setting: Omit<KioskSetting, 'id' | 'createdAt' | 'etag'>): Promise<KioskSetting> {
		const result = await mockKioskSettings.createKioskSetting(setting);
		return configFields(result);
	},

	async updateKioskSetting(
		id: string,
		etag: string,
		updates: Partial<Omit<KioskSetting, 'id' | 'createdAt' | 'etag'>>,
	): Promise<KioskSetting> {
		const result = await mockKioskSettings.updateKioskSetting(id, etag, updates);
		return configFields(result);
	},

	async deleteKioskSetting(id: string): Promise<void> {
		await mockKioskSettings.deleteKioskSetting(id);
	},
};

